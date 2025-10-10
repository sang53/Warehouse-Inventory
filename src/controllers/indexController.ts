import type { Response, Request, NextFunction } from "express";
import { getCurrentTask } from "../services/tasks.ts";
import getCurrentLocals from "../utils/getLocals/getCurrentLocals.ts";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import Location from "../models/locationsModel.ts";
import getIndexLocals from "../utils/getLocals/getIndexLocals.ts";
import { FullTask } from "../models/tasksModel.ts";

export const indexGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const inOrders = await Order.getByComplete(false, "IN");
    const outOrders = await Order.getByComplete(false, "OUT");
    const tasks = await FullTask.getByComplete(false);

    res.locals = getIndexLocals({
      inOrders,
      outOrders,
      tasks,
    });
    next();
  },
];

export const currentGet = [
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    // Prevent admins from being assigned tasks
    if (user.u_role === "admin") {
      res.redirect("/");
      return;
    }

    // get task or assign oldest available task
    const task = await getCurrentTask(user, true);
    if (task === null)
      throw new Error("No available tasks - report to team leader");

    // get current location of pallet
    const { l_name } = (await Location.get({ pa_id: task.pa_id }))[0];

    // get product information of order
    const order = await ProductOrder.getByTask(task.t_id);
    const fullOrder = await ProductOrder.getProducts(order);

    res.locals = getCurrentLocals({
      l_name,
      user,
      task,
      products: fullOrder.products,
    });
    next();
  },
];
