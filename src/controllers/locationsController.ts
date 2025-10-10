import type { NextFunction, Request, Response } from "express";
import Location from "../models/locationsModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";

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
    const location = await Location.get({ l_id: id });

    res.locals = getDisplayLocals({
      title: `Location ${String(id)}`,
      tableData: location,
    });
    next();
  },
];
