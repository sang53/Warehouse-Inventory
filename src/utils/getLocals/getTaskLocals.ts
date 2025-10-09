import { ProductOrder } from "../../models/ordersModel.ts";
import { FullTask } from "../../models/tasksModel.ts";
import extractKeys from "../extractKeys.ts";
import mapToView from "../mapToView.ts";

interface TaskLocals {
  task: FullTask;
  order: ProductOrder;
}

export default function ({ task, order }: TaskLocals) {
  return {
    view: "task",
    viewData: {
      task: extractKeys(task, [
        "t_id",
        "t_type",
        "placed",
        "started",
        "completed",
        "pa_id",
        "l_id",
        "u_id",
      ]),
      order: extractKeys(order, ["o_id", "o_type", "placed", "completed"]),
      products: mapToView(order.products),
    },
  };
}
