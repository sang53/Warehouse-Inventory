import type { Response, Request, NextFunction } from "express";
import { getCurrentTask } from "../services/tasks.ts";
import getCurrentLocals from "../getLocals/getCurrentLocals.ts";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import Location from "../models/locationsModel.ts";
import { FullTask } from "../models/tasksModel.ts";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";

export const indexGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [inOrders, outOrders, tasks] = await Promise.all([
      await Order.getByComplete(false, "IN"),
      await Order.getByComplete(false, "OUT"),
      await FullTask.getByComplete(false),
    ]);

    res.locals = getDisplayLocals([
      {
        title: "Current Tasks",
        tableData: tasks,
      },
      { title: "Current Incoming Orders", tableData: inOrders },
      {
        title: "Current Outgoing Orders",
        tableData: outOrders,
      },
    ]);
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
    const task = await getCurrentTask(user);
    if (task === null)
      throw new Error("No available tasks - report to team leader");

    // get current location of pallet
    let l_name;
    try {
      const [location] = await Location.get({ pa_id: task.pa_id });
      l_name = location.l_name;
    } catch {
      // task pallet is not in location (arrival or pick)
      l_name = "New Pallet";
    }

    // get product information of order
    const fullOrder = await ProductOrder.getFull({ t_id: task.t_id });

    res.locals = await getCurrentLocals({
      l_name,
      user,
      task,
      o_id: fullOrder.o_id,
      products: fullOrder.products,
    });
    next();
  },
];
