import type { NextFunction, Request, Response } from "express";
import { FullTask } from "../models/tasksModel.js";
import {
  checkValidation,
  validateInt,
  validateOptionalInt,
} from "../middlewares/validate.js";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import { completeTask } from "../services/tasks.js";
import { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { ProductOrder } from "../models/ordersModel.js";
import mapToView from "../utils/mapToView.js";
import getTaskLocals from "../getLocals/getTaskLocals.js";
import User from "../models/usersModel.js";
import extractKeys from "../utils/extractKeys.js";

export const tasksGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const tableData = await FullTask.getAll();

    res.locals = getDisplayLocals(
      [
        {
          title: "All Tasks",
          tableData,
        },
      ],
      { searchBar: true },
    );
    next();
  },
];

export const taskCompleteGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [inTask, pickTask, outTask] = await Promise.all([
      FullTask.getByComplete(true, ["arrival", "intake", "storage"]),
      FullTask.getByComplete(true, ["pick"]),
      FullTask.getByComplete(true, ["outgoing", "export"]),
    ]);

    res.locals = getDisplayLocals([
      {
        title: "Incoming Tasks",
        tableData: inTask,
      },
      {
        title: "Picking Tasks",
        tableData: pickTask,
      },
      {
        title: "Outgoing Tasks",
        tableData: outTask,
      },
    ]);
    next();
  },
];

export const taskIncompleteGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [inTask, pickTask, outTask] = await Promise.all([
      FullTask.getByComplete(false, ["arrival", "intake", "storage"]),
      FullTask.getByComplete(false, ["pick"]),
      FullTask.getByComplete(false, ["outgoing", "export"]),
    ]);

    const displayKeys = [
      "t_id",
      "t_type",
      "placed",
      "started",
      "pa_id",
      "l_id",
      "u_id",
      "o_id",
    ] as const;

    res.locals = getDisplayLocals([
      {
        title: "Incoming Tasks",
        tableData: inTask.map((task) => extractKeys(task, displayKeys)),
      },
      {
        title: "Picking Tasks",
        tableData: pickTask.map((task) => extractKeys(task, displayKeys)),
      },
      {
        title: "Outgoing Tasks",
        tableData: outTask.map((task) => extractKeys(task, displayKeys)),
      },
    ]);
    next();
  },
];

export const tasksIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);

    const [tasks, { products, ...order }] = await Promise.all([
      FullTask.getFull({ t_id: id }),
      ProductOrder.getFull({ t_id: id }),
    ]);

    res.locals = getTaskLocals(
      [
        { title: `Task ${String(id)}`, tableData: tasks },
        {
          title: `Order ${String(order.o_id)}`,
          tableData: [
            {
              ...order,
              t_ids: order.t_ids?.join(", "),
            },
          ],
        },
        { title: "Products", tableData: mapToView(products) },
      ],
      id,
    );
    next();
  },
];

export const tasksIDPost = [
  validateInt("id"),
  validateOptionalInt("u_id"),
  checkValidation,
  // handle both cases: user self completing from /current or admin from /tasks/id/:id
  async (req: Request, res: Response) => {
    const { id, u_id } = matchedData<{ id: number; u_id?: number }>(req);

    const [task] = await FullTask.getFull({ t_id: id });
    // make sure task is valid
    if (task.completed) throw new Error(`Task ${String(id)} Already Completed`);

    // designating user = self or admin
    const currUser = (req as AuthenticatedRequest).user;
    // designated user = self or designated by admin or admin self
    const taskUser = u_id ? (await User.get({ u_id }))[0] : currUser;

    // check valid designated user
    if (!taskUser) throw new Error("Invalid user to complete task");

    // check designated user is assigned or designating user is admin
    if (taskUser.u_id !== task.u_id && currUser.u_role !== "admin")
      throw new Error("Permission Denied");

    // if assigned user is not designated user, update db
    if (task.u_id !== taskUser.u_id)
      await Promise.all([
        task.updateRels({ u_id: taskUser.u_id }),
        task.setStart(true),
      ]);

    await completeTask(task);
    if (currUser.u_id === taskUser.u_id && currUser.u_role !== "admin")
      res.redirect("/current");
    else res.redirect(`/tasks/id/${String(id)}`);
  },
];
