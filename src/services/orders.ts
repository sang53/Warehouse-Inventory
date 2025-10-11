import { OrderType, T_IN, TASK_TYPES } from "../config/tableTypes.ts";
import Location from "../models/locationsModel.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import Pallet, { ProductPallet } from "../models/palletsModel.ts";
import { FullTask } from "../models/tasksModel.ts";

export async function createOrder(
  o_type: T_IN["ORDERS"]["o_type"],
  products: number[],
  stock: number[],
) {
  const task = await createFirstTask(o_type);
  const order = await ProductOrder.create(
    { o_type },
    task.t_id,
    products,
    stock,
  );
  return { order, task };
}

async function createFirstTask(o_type: OrderType) {
  const taskData =
    o_type === "IN" ? { t_type: TASK_TYPES[0] } : { t_type: TASK_TYPES[3] };
  const pallet = await Pallet.create();
  return await FullTask.create(taskData, pallet.pa_id);
}

export async function completeOrder(task: FullTask, order: Order) {
  // remove pallet from location
  if (order.o_type === "OUT") {
    await Promise.all([
      Location.movePallet(task.pa_id),
      ProductPallet.removePallet(task.pa_id),
    ]);
  }
  await order.complete();
  return null;
}
