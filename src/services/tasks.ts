import {
  OrderType,
  T_OUT,
  TASK_TYPES,
  TaskType,
  USER_TASK_MAP,
} from "../config/tableTypes.ts";
import Location from "../models/locationsModel.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";
import Task, { FullTask } from "../models/tasksModel.ts";
import User from "../models/usersModel.ts";
import { completeOrder } from "./orders.ts";
import { removeFromStorage } from "./stock.ts";

const NEWPALLET = ["arrival", "pick"] as const;
const LTYPEMAP = {
  arrival: "intake",
  storage: "storage",
  pick: "outgoing",
} as const;
const END_ORDER_MAP: Record<OrderType, TaskType> = {
  IN: "storage",
  OUT: "export",
} as const;

export async function getCurrentTask(user: User, start: boolean = true) {
  // return if task already assigned || not starting new task
  try {
    const [task] = await FullTask.getByRels({ u_id: user.u_id });
    return task;
  } catch {
    if (!start) return null;
  }

  // find oldest corresponding task
  const task = await Task.getNewByTypes(USER_TASK_MAP[user.u_role]);
  if (!task) return null;
  // set up and start task
  return await startTask(task, user);
}

async function startTask(task: Task, user: User) {
  const taskRels: Partial<T_OUT["TASKREL"]> = { u_id: user.u_id };

  // overwrite current location w/ new location
  if (needsLocation(task.t_type))
    taskRels.l_id = await Location.getEmpty(LTYPEMAP[task.t_type]);

  // save data & start timestamp
  const fullTask = await task.updateRels(taskRels);
  return await fullTask.setStart();
}

export async function completeTask(task: FullTask) {
  const order = await Order.getByTask(task.t_id);
  if (needsPallet(task.t_type)) {
    const pallet = await ProductPallet.get({ pa_id: task.pa_id });
    const fullOrder = await ProductOrder.getProducts(order);

    // remove products from storage if picking task
    if (task.t_type === "pick") await removeFromStorage(fullOrder.products);

    // add products to pallet
    await pallet.addProductsMap(fullOrder.products);
  }
  if (needsLocation(task.t_type))
    // move pallet to new location
    await Location.movePallet(task.pa_id, task.l_id);

  await task.complete();
  await nextTask(task, order);
}

export async function nextTask(task: FullTask, order: Order) {
  if (task.t_type === END_ORDER_MAP[order.o_type])
    // case: last task for order
    return await completeOrder(task, order);

  // generate next task & add carryover rels
  const newTask = await FullTask.create(
    {
      t_type: iterateTaskType(task.t_type),
    },
    task.pa_id,
    { l_id: task.l_id },
  );
  await order.addTask(newTask.t_id);
  return newTask;
}

function iterateTaskType(t_type: TaskType) {
  const idx = TASK_TYPES.findIndex((value) => value === t_type);
  const newTType = TASK_TYPES[idx + 1];
  if (!newTType) throw new Error("System Error");
  return newTType;
}

function needsLocation(t_type: TaskType): t_type is keyof typeof LTYPEMAP {
  return t_type in LTYPEMAP;
}

function needsPallet(t_type: TaskType) {
  return NEWPALLET.some((type) => type === t_type);
}
