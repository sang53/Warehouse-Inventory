import type { NextFunction, Request, Response } from "express";
import User from "../models/usersModel.ts";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
} from "../middlewares/validate.ts";
import { body, matchedData } from "express-validator";
import { T_IN, U_Types } from "../config/tableTypes.ts";
import createUser from "../services/createUser.ts";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";

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
    const user = await User.get(id);

    res.locals = getDisplayLocals({
      title: `User ${user.u_name}`,
      tableData: [user],
    });
    next();
  },
];

export const usersNewGet = [
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
  validateAlphaNum("u_name"),
  validateAlphaNum("username"),
  validateAlphaNum("u_role"),
  body("u_role").isIn(Object.values(U_Types)),
  checkValidation,
  async (req: Request, res: Response) => {
    const userData = matchedData<T_IN["USERS"]>(req);
    await createUser(userData);
    res.redirect(`/users`);
  },
];

export const usersIDTasksGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const user = await User.get(id);

    if (user.u_role === U_Types.ADMIN) {
      res.redirect("/");
      return;
    }

    // TODO: get current task for user
  },
];
