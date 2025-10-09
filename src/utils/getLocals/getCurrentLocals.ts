import Location from "../../models/locationsModel.ts";
import { FullTask } from "../../models/tasksModel.ts";
import User from "../../models/usersModel.ts";
import extractKeys from "../extractKeys.ts";
import mapToView from "../mapToView.ts";

interface CurrentLocals {
  user: User;
  task: FullTask;
  products: Map<number, number>;
  l_name: string;
}

export default async function ({
  user,
  task,
  products,
  l_name,
}: CurrentLocals) {
  return {
    view: "current",
    viewData: {
      l_name,
      user: extractKeys(user, ["u_id", "u_name", "u_role"]),
      task: extractKeys(task, ["t_id", "t_type", "pa_id", "l_id", "placed"]),
      products:
        task.t_type === "pick"
          ? await Location.getByProducts(products)
          : mapToView(products),
    },
  };
}
