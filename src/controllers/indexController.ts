import type { Response, Request, NextFunction } from "express";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import { getCurrentTask } from "../services/tasks.ts";
import getCurrentLocals from "../utils/getLocals/getCurrentLocals.ts";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";
import { ProductOrder } from "../models/ordersModel.ts";
import { FullTask } from "../models/tasksModel.ts";
import Location from "../models/locationsModel.ts";

export const indexGet = [
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals({
      title: "Index",
      tableData: [],
    });
    next();
  },
];

export const currentGet = [
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    // Prevent admins from being assigned tasks
    if (user.u_role === "admin") {
      res.redirect("/");
      return;
    }

    // get task or assign oldest available task
    const task = await getCurrentTask(user, true);
    if (task === null)
      throw new Error("No available tasks - report to team leader");
    const fullTask = await FullTask.getRels(task);

    // get current location of pallet
    const { l_name } = (await Location.get({ pa_id: fullTask.pa_id }))[0];

    // get product information of order
    const order = await ProductOrder.getByTask(task.t_id);
    const fullOrder = await ProductOrder.getProducts(order);

    res.locals = getCurrentLocals({
      l_name,
      user,
      task: fullTask,
      products: fullOrder.products,
    });
    next();
  },
];
