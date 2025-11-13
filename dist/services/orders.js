import Location from "../models/locationsModel.js";
import { ProductOrder } from "../models/ordersModel.js";
import Pallet, { ProductPallet } from "../models/palletsModel.js";
import { FullTask } from "../models/tasksModel.js";
import transaction from "../utils/transaction.js";
export async function createOrder(o_type, products, stock, client) {
    if (client)
        return await interalCreateOrder(client, { o_type, products, stock });
    return await transaction(interalCreateOrder, { o_type, products, stock });
}
async function interalCreateOrder(client, { o_type, products, stock, }) {
    await validateProducts(products, client);
    const task = await createFirstTask(o_type, client);
    // create order & link task
    const order = await ProductOrder.create({ o_type, t_id: task.t_id }, products, stock, client);
    return { order, task };
}
async function createFirstTask(o_type, client) {
    // get corresponding task type for order type
    const t_type = o_type === "IN" ? "arrival" : "pick";
    // create new pallet and assign to new task
    const pallet = await Pallet.create(client);
    return await FullTask.create(client, { t_type }, pallet.pa_id);
}
export async function completeOrder(task, order, client) {
    if (order.o_type === "OUT") {
        // if out order: remove palletfrom location and DB
        await Promise.all([
            Location.movePallet(task.pa_id, null, client),
            ProductPallet.removePallet(task.pa_id, client),
        ]);
    }
    await order.complete(client);
    return null;
}
async function validateProducts(products, client) {
    const DBproducts = await ProductOrder.validateProducts(products, client);
    const ValidProducts = new Set(DBproducts.map((product) => product.p_id));
    const invalidProducts = products.filter((p_id) => !ValidProducts.has(p_id));
    if (invalidProducts.length)
        throw new Error(`Invalid Product ID/s: ${String(invalidProducts)}`);
}
