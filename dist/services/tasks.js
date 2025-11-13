import Location from "../models/locationsModel.js";
import Order, { ProductOrder } from "../models/ordersModel.js";
import { ProductPallet } from "../models/palletsModel.js";
import Task, { FullTask } from "../models/tasksModel.js";
import { completeOrder } from "./orders.js";
import { mapToProductStock, removeFromStorage } from "./stock.js";
import transaction from "../utils/transaction.js";
const LTYPEMAP = {
    arrival: "intake",
    storage: "storage",
    pick: "outgoing",
};
export async function getCurrentTask(user, client) {
    const [currentTask] = await FullTask.getCurrentByUser(user.u_id, client);
    if (currentTask)
        return currentTask;
    const USER_TASK_MAP = {
        intake: ["arrival", "intake", "storage"],
        picker: ["pick"],
        outgoing: ["outgoing", "export"],
        admin: [],
    };
    const task = await Task.getNewByTypes(USER_TASK_MAP[user.u_role], client);
    if (!task)
        return null;
    if (client)
        return await startTask(client, { task, user });
    return await transaction(startTask, { task, user });
}
async function startTask(client, { task, user }) {
    const taskRels = { u_id: user.u_id };
    if (needsLocation(task.t_type))
        // overwrite current location w/ new location
        taskRels.l_id = await Location.getEmpty(LTYPEMAP[task.t_type], client);
    // save task rels & start timestamp in transaction
    const fullTask = await task.updateRels(taskRels, client);
    return await fullTask.setStart(true, client);
}
export async function completeTask(task, client) {
    if (client)
        await internalCompleteTask(client, task);
    else
        await transaction(internalCompleteTask, task);
}
async function internalCompleteTask(client, task) {
    const order = await Order.getByTask(task.t_id, client);
    if (needsPallet(task.t_type)) {
        const fullOrder = await ProductOrder.getProducts(order, client);
        // remove products from storage if picking task
        if (task.t_type === "pick")
            await removeFromStorage(fullOrder.products, client);
        // add products to pallet
        const productStocks = mapToProductStock(fullOrder.products, task.pa_id);
        await ProductPallet.modifyProducts(productStocks, client, "+");
    }
    if (needsLocation(task.t_type))
        // if pallet was moved new location:
        // remove pallet from old location & move pallet to new location
        await Location.movePallet(task.pa_id, task.l_id, client);
    await Promise.all([task.complete(client), nextTask(task, order, client)]);
}
export async function nextTask(task, order, client) {
    const END_ORDER_MAP = {
        IN: "storage",
        OUT: "export",
    };
    if (task.t_type === END_ORDER_MAP[order.o_type])
        // case: last task for order
        return await completeOrder(task, order, client);
    // generate next task & add carryover rels
    const newTask = await FullTask.create(client, {
        t_type: iterateTaskType(task.t_type),
    }, task.pa_id, { l_id: task.l_id });
    await order.addTask(newTask.t_id, client);
    return newTask;
}
function iterateTaskType(t_type) {
    const TASK_TYPES = [
        "arrival",
        "intake",
        "storage",
        "pick",
        "outgoing",
        "export",
    ];
    const idx = TASK_TYPES.findIndex((value) => value === t_type);
    const newTType = TASK_TYPES[idx + 1];
    if (!newTType)
        throw new Error("System Error"); // uneeded check for TS
    return newTType;
}
function needsLocation(t_type) {
    return t_type in LTYPEMAP;
}
function needsPallet(t_type) {
    const NEWPALLET = ["arrival", "pick"];
    return NEWPALLET.some((type) => type === t_type);
}
