import type { NextFunction, Request, Response } from "express";
import Location from "../models/locationsModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import getLocationLocals from "../getLocals/getLocationLocals.ts";
import { FullTask } from "../models/tasksModel.ts";

export const locationsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals([
      { title: "All Locations", tableData: await Location.getAll() },
    ]);
    next();
  },
];

export const locationsIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const [[location], [{ t_id }]] = await Promise.all([
      Location.get({ l_id: id }),
      FullTask.getByRels({ l_id: id }),
    ]);

    res.locals = getLocationLocals({
      location,
      t_id,
    });
    next();
  },
];
