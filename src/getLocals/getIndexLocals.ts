import Order from "../models/ordersModel.ts";
import { FullTask } from "../models/tasksModel.ts";
import extractKeys from "../utils/extractKeys.ts";

interface IndexLocals {
  tasks: FullTask[];
  inOrders: Order[];
  outOrders: Order[];
}

export default function ({ tasks, inOrders, outOrders }: IndexLocals) {
  return {
    view: "index",
    viewData: {
      tasks: tasks.map((task) =>
        extractKeys(task, ["t_id", "t_type", "started", "u_id"]),
      ),
      inOrders: inOrders.map((order) =>
        extractKeys(order, ["o_id", "placed", "t_id"]),
      ),
      outOrders: outOrders.map((order) =>
        extractKeys(order, ["o_id", "placed", "t_id"]),
      ),
    },
  };
}
