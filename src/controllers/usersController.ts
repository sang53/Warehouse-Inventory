import type { NextFunction, Request, Response } from "express";
import User, { InUser } from "../models/usersModel.ts";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
} from "../middlewares/validate.ts";
import { body, matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import getFormLocals from "../getLocals/getFormLocals.ts";
import getUserLocals from "../getLocals/getUserLocals.ts";
import { getCurrentTask } from "../services/tasks.ts";
import { ensureRole } from "../middlewares/authenticate.ts";

export const usersGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const users = await User.getAll();
    res.locals = getDisplayLocals(
      [
        {
          title: "All Users",
          tableData: users,
        },
      ],
      { searchBar: true, addBtn: true },
    );
    next();
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

    // retrieve current task
    const task = await getCurrentTask(user);
    const t_id = task?.t_id ?? null;

    res.locals = getUserLocals({ user, t_id });
    next();
  },
];

export const usersNewGet = [
  ensureRole(),
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getFormLocals({
      title: "New User",
      action: "/users/new",
      field: "USERS",
    });
    next();
  },
];

export const usersNewPost = [
  ensureRole(),
  validateAlphaNum("u_name"),
  validateAlphaNum("username"),
  validateAlphaNum("u_role"),
  body("u_role").isIn(["admin", "intake", "picker", "outgoing"]),
  checkValidation,
  async (req: Request, res: Response) => {
    const userData = matchedData<InUser>(req);
    await User.create(userData);
    res.redirect(`/users`);
  },
];
