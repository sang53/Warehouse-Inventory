import Location from "../models/locationsModel.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";
import Task, { FullTask, OutTaskRel, TaskType } from "../models/tasksModel.ts";
import User, { UserType } from "../models/usersModel.ts";
import { completeOrder } from "./orders.ts";
import { removeFromStorage } from "./stock.ts";

const LTYPEMAP = {
  arrival: "intake",
  storage: "storage",
  pick: "outgoing",
} as const;

export async function getCurrentTask(user: User, start: boolean = true) {
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

  // find oldest corresponding task
  const task = await Task.getNewByTypes(USER_TASK_MAP[user.u_role]);
  if (!task) return null;
  // set up and start task
  return await startTask(task, user);
}

async function startTask(task: Task, user: User) {
  const taskRels: Partial<OutTaskRel> = { u_id: user.u_id };

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
    const [pallet, fullOrder] = await Promise.all([
      ProductPallet.get({ pa_id: task.pa_id }),
      ProductOrder.getProducts(order),
    ]);

    // remove products from storage if picking task
    if (task.t_type === "pick") await removeFromStorage(fullOrder.products);

    // add products to pallet
    await pallet.addProductsMap(fullOrder.products);
  } else if (needsLocation(task.t_type))
    // move pallet to new location
    await Location.movePallet(task.pa_id, task.l_id);

  await Promise.all([task.complete(), nextTask(task, order)]);
}

export async function nextTask(task: FullTask, order: Order) {
  const END_ORDER_MAP = {
    IN: "storage",
    OUT: "export",
  } as const;

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

  if (!newTType) throw new Error("System Error"); // for TS error
  return newTType;
}

function needsLocation(t_type: TaskType): t_type is keyof typeof LTYPEMAP {
  return t_type in LTYPEMAP;
}

function needsPallet(t_type: TaskType) {
  const NEWPALLET = ["arrival", "pick"] as const;
  return NEWPALLET.some((type) => type === t_type);
}
