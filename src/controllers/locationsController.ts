import type { NextFunction, Request, Response } from "express";
import Location from "../models/locationsModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getLocationLocals from "../utils/getLocals/getLocationLocals.ts";
import { FullTask } from "../models/tasksModel.ts";

export const locationsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals({
      title: "All Locations",
      tableData: await Location.getAll(),
    });
    next();
  },
];

// TODO: Maybe add current pallet/task info
// add info whether currently reserved by task
export const locationsIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const location = (await Location.get({ l_id: id }))[0];
    const { t_id } = (await FullTask.getByRels({ l_id: id }))[0];

    res.locals = getLocationLocals({ location, t_id });
    next();
  },
];
