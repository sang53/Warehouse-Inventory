import { PoolClient } from "pg";
import Location from "../models/locationsModel.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";
import Task, { FullTask, OutTaskRel, TaskType } from "../models/tasksModel.ts";
import User, { UserType } from "../models/usersModel.ts";
import { completeOrder } from "./orders.ts";
import { mapToProductStock, removeFromStorage } from "./stock.ts";
import transaction from "../utils/transaction.ts";

const LTYPEMAP = {
  arrival: "intake",
  storage: "storage",
  pick: "outgoing",
} as const;

export async function getCurrentTask(
  user: User,
  start: boolean = true,
  client?: PoolClient,
) {
  try {
    // if task already assigned to user
    const [task] = await FullTask.getByRels({ u_id: user.u_id });
    return task;
  } catch {
    // if only retrieving current task:
    // return if no task assigned
    if (!start) return null;
  }

  const USER_TASK_MAP: Record<UserType, TaskType[]> = {
    intake: ["arrival", "intake", "storage"],
    picker: ["pick"],
    outgoing: ["outgoing", "export"],
    admin: [],
  } as const;

  const task = await Task.getNewByTypes(USER_TASK_MAP[user.u_role], client);
  if (!task) return null;

  if (client) return await startTask(client, { task, user });
  return await transaction(startTask, { task, user });
}

async function startTask(
  client: PoolClient,
  { task, user }: { task: Task; user: User },
) {
  const taskRels: Partial<OutTaskRel> = { u_id: user.u_id };

  if (needsLocation(task.t_type))
    // overwrite current location w/ new location
    taskRels.l_id = await Location.getEmpty(LTYPEMAP[task.t_type], client);

  // save task rels & start timestamp in transaction
  const fullTask = await task.updateRels(taskRels, client);
  return await fullTask.setStart(true, client);
}

export async function completeTask(task: FullTask, client?: PoolClient) {
  if (client) await internalCompleteTask(client, task);
  else await transaction(internalCompleteTask, task);
}

async function internalCompleteTask(client: PoolClient, task: FullTask) {
  const order = await Order.getByTask(task.t_id, client);

  if (needsPallet(task.t_type)) {
    const fullOrder = await ProductOrder.getProducts(order, client);

    // remove products from storage if picking task
    if (task.t_type === "pick")
      await removeFromStorage(fullOrder.products, client);

    // add products to pallet
    const productStocks = mapToProductStock(fullOrder.products, task.pa_id);
    await ProductPallet.modifyProducts(productStocks, client, "+");
  } else if (needsLocation(task.t_type))
    // if pallet was moved new location:
    // remove pallet from old location & move pallet to new location
    await Location.movePallet(task.pa_id, task.l_id, client);

  await Promise.all([task.complete(client), nextTask(task, order, client)]);
}

export async function nextTask(
  task: FullTask,
  order: Order,
  client: PoolClient,
) {
  const END_ORDER_MAP = {
    IN: "storage",
    OUT: "export",
  } as const;

  if (task.t_type === END_ORDER_MAP[order.o_type])
    // case: last task for order
    return await completeOrder(task, order, client);

  // generate next task & add carryover rels
  const newTask = await FullTask.create(
    client,
    {
      t_type: iterateTaskType(task.t_type),
    },
    task.pa_id,
    { l_id: task.l_id }, // default: keep pallet at same location
  );
  await order.addTask(newTask.t_id, client);
  return newTask;
}

function iterateTaskType(t_type: TaskType) {
  const TASK_TYPES = [
    "arrival",
    "intake",
    "storage",
    "pick",
    "outgoing",
    "export",
  ] as const;

  const idx = TASK_TYPES.findIndex((value) => value === t_type);
  const newTType = TASK_TYPES[idx + 1];

  if (!newTType) throw new Error("System Error"); // uneeded check for TS
  return newTType;
}

function needsLocation(t_type: TaskType): t_type is keyof typeof LTYPEMAP {
  return t_type in LTYPEMAP;
}

function needsPallet(t_type: TaskType) {
  const NEWPALLET = ["arrival", "pick"] as const;
  return NEWPALLET.some((type) => type === t_type);
}
