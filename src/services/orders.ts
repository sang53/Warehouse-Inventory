import { PoolClient } from "pg";
import Location from "../models/locationsModel.ts";
import Order, { OrderType, ProductOrder } from "../models/ordersModel.ts";
import Pallet, { ProductPallet } from "../models/palletsModel.ts";
import { FullTask } from "../models/tasksModel.ts";
import transaction from "../utils/transaction.ts";

export async function createOrder(
  o_type: OrderType,
  products: number[],
  stock: number[],
  client?: PoolClient,
) {
  if (client)
    return await interalCreateOrder(client, { o_type, products, stock });
  return await transaction(interalCreateOrder, { o_type, products, stock });
}

async function interalCreateOrder(
  client: PoolClient,
  {
    o_type,
    products,
    stock,
  }: { o_type: OrderType; products: number[]; stock: number[] },
) {
  const task = await createFirstTask(o_type, client);

  await validateProducts(products);

  // create order & link task
  const order = await ProductOrder.create(
    { o_type, t_id: task.t_id },
    products,
    stock,
    client,
  );
  return { order, task };
}

async function createFirstTask(o_type: OrderType, client: PoolClient) {
  // get corresponding task type for order type
  const t_type = o_type === "IN" ? "arrival" : "pick";

  // create new pallet and assign to new task
  const pallet = await Pallet.create();
  return await FullTask.create(client, { t_type }, pallet.pa_id);
}

export async function completeOrder(
  task: FullTask,
  order: Order,
  client: PoolClient,
) {
  if (order.o_type === "OUT") {
    // if out order: remove palletfrom location and DB
    await Promise.all([
      Location.movePallet(task.pa_id, null, client),
      ProductPallet.removePallet(task.pa_id, client),
    ]);
  }
  await order.complete();
  return null;
}

async function validateProducts(products: number[]) {
  const DBproducts = await ProductOrder.validateProducts(products);

  const ValidProducts = new Set(DBproducts.map((product) => product.p_id));
  const invalidProducts = products.filter((p_id) => !ValidProducts.has(p_id));
  if (invalidProducts.length)
    throw new Error(`Invalid Product ID/s: ${String(invalidProducts)}`);
}
