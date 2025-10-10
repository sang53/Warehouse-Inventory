import type { NextFunction, Request, Response } from "express";
import { FullTask } from "../models/tasksModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import { completeTask } from "../services/tasks.ts";
import getTaskLocals from "../utils/getLocals/getTaskLocals.ts";
import {
  AuthenticatedRequest,
  ensureRole,
} from "../middlewares/authenticate.ts";
import { ProductOrder } from "../models/ordersModel.ts";

export const tasksGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [incomplete, complete] = await Promise.all([
      FullTask.getByComplete(false),
      FullTask.getByComplete(true),
    ]);

    res.locals = getDisplayLocals([
      {
        title: "Incomplete Tasks",
        tableData: incomplete,
      },
      {
        title: "Completed Tasks",
        tableData: complete,
      },
    ]);
    next();
  },
];

export const tasksIDGet = [
  ensureRole(),
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const task = (await FullTask.getFull({ t_id: id }))[0];
    const order = await ProductOrder.getByTask(task.t_id);
    const fullOrder = await ProductOrder.getProducts(order);

    res.locals = getTaskLocals({ task, order: fullOrder });
    next();
  },
];

export const tasksIDPost = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { id } = matchedData<{ id: number }>(req);
    const task = (await FullTask.getFull({ t_id: id }))[0];
    const user = (req as AuthenticatedRequest).user;

    // make sure task is valid
    if (task.completed) throw new Error(`Task ${String(id)} Already Completed`);

    // make sure admin or assigned user
    if (user.u_role !== "admin" && user.u_id !== task.u_id)
      throw new Error("Permission Denied");

    await completeTask(task);
    res.redirect("/current");
  },
];
