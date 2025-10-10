import type { NextFunction, Request, Response } from "express";
import User, { VerifyUser } from "../models/usersModel.ts";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
} from "../middlewares/validate.ts";
import { body, matchedData } from "express-validator";
import { T_IN, USER_TYPES } from "../config/tableTypes.ts";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";
import getUserLocals from "../utils/getLocals/getUserLocals.ts";
import { getCurrentTask } from "../services/tasks.ts";
import { ensureRole } from "../middlewares/authenticate.ts";

export const usersGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const users = await User.getAll();
    res.locals = getDisplayLocals({
      title: "All Users",
      tableData: users,
    });
    next();
  },
];

export const usersIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);

    // retrieve user from database
    const user = (await User.get({ u_id: id }))[0];

    // retrieve current task
    const t_id = (await getCurrentTask(user))?.t_id ?? null;

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
  body("u_role").isIn(USER_TYPES),
  checkValidation,
  async (req: Request, res: Response) => {
    const userData = matchedData<T_IN["USERS"]>(req);
    await VerifyUser.create(userData);
    res.redirect(`/users`);
  },
];
