import type { NextFunction, Request, Response } from "express";
import User, { InUser } from "../models/usersModel.ts";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
  validatePassword,
  validateURole,
} from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import getUserLocals from "../getLocals/getUserLocals.ts";
import { ensureRole } from "../middlewares/authenticate.ts";
import getUserForm from "../getLocals/getUserForm.ts";
import { FullTask } from "../models/tasksModel.ts";
import extractKeys from "../utils/extractKeys.ts";
import Order from "../models/ordersModel.ts";

export const usersGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const users = await User.getAll();
    const userData = await Promise.all(
      users.map(async (user) => addCurrentTaskOrder(user)),
    );
    res.locals = getDisplayLocals(
      [
        {
          title: "All Users",
          tableData: userData,
        },
      ],
      { searchBar: true, addBtn: true },
    );
    next();

    async function addCurrentTaskOrder(user: User) {
      const plainUser = extractKeys(user, ["u_id", "u_name", "u_role"]);

      const task = await FullTask.getCurrentByUser(user.u_id);
      if (!task) return { ...plainUser, t_id: null, o_id: null } as const;

      const { o_id } = await Order.getByTask(task.t_id);
      return { ...plainUser, t_id: task.t_id, o_id } as const;
    }
  },
];

export const usersIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);

    // retrieve user from database
    const [user] = await User.get({ u_id: id });
    if (!user) throw new Error(`User ${String(id)} Not Found`);

    // retrieve previous tasks
    const tasks = await FullTask.getByRels({ u_id: id }, null);

    // retrieve current task
    const currentTask = await FullTask.getCurrentByUser(user.u_id);
    const t_id = currentTask ? currentTask.t_id : null;

    res.locals = getUserLocals({ user, t_id, tasks });
    next();
  },
];

export const usersNewGet = [
  ensureRole(),
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getUserForm();
    next();
  },
];

export const usersNewPost = [
  ensureRole(),
  validateAlphaNum("u_name"),
  validateAlphaNum("username"),
  ...validatePassword(),
  ...validateURole(),
  checkValidation,
  async (req: Request, res: Response) => {
    const { passwordConfirm, ...userData } = matchedData<
      InUser & { passwordConfirm: string }
    >(req);
    if (passwordConfirm !== userData.password)
      throw new Error("Passwords must match");
    const user = await User.create(userData);
    res.redirect(`/users/id/${String(user.u_id)}`);
  },
];
