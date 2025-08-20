import type { NextFunction, Request, Response } from "express";
import Task from "../models/tasksModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";

export const tasksGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const tasks = await Task.getAllTasks();

    res.locals = getDisplayLocals({
      title: "All Tasks",
      tableData: tasks,
    });
    next();
  },
];

export const tasksIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const task = await Task.getTask(id);

    res.locals = getDisplayLocals({
      title: `Task ${String(id)}`,
      tableData: [task],
    });
    next();
  },
];

export const tasksIDPost = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { id } = matchedData<{ id: number }>(req);
    const task = await Task.getTask(id);
    await task.complete();
    res.redirect(`/tasks/${String(id)}`);
  },
];
