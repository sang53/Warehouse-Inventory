import { FullTask } from "../models/tasksModel.js";
import User from "../models/usersModel.js";
import { getProductInfo } from "../services/stock.js";
import extractKeys from "../utils/extractKeys.js";
import mapToView from "../utils/mapToView.js";

interface CurrentLocals {
  user: User;
  task: FullTask;
  products: Map<number, number>;
  l_name: string;
  o_id: number;
}

export default async function ({
  user,
  task,
  products,
  l_name,
  o_id,
}: CurrentLocals) {
  return {
    view: "current",
    viewData: {
      o_id,
      l_name,
      user,
      task: extractKeys(task, [
        "t_id",
        "t_type",
        "pa_id",
        "l_id",
        "placed",
        "started",
      ]),
      products:
        task.t_type === "pick"
          ? await getProductInfo(products)
          : { data: mapToView(products) },
    },
  };
}
