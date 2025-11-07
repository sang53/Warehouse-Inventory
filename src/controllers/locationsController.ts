import type { NextFunction, Request, Response } from "express";
import Location from "../models/locationsModel.js";
import { checkValidation, validateInt } from "../middlewares/validate.js";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import getLocationLocals from "../getLocals/getLocationLocals.js";
import { FullTask } from "../models/tasksModel.js";
import extractKeys from "../utils/extractKeys.js";

export const locationsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const locations = await Location.getAll();
    const locationsData = await Promise.all(
      locations.map(async (location) => getTaskId(location)),
    );

    res.locals = getDisplayLocals(
      [
        {
          title: "All Locations",
          tableData: locationsData.map(([location, t_id]) => ({
            ...extractKeys(location, ["l_id", "l_name", "l_role", "pa_id"]),
            t_id,
          })),
        },
      ],
      { searchBar: true },
    );
    next();

    async function getTaskId(location: Location) {
      const task = (await FullTask.getByLocation(location.l_id)) ?? {
        t_id: null,
      };
      return [location, task.t_id] as const;
    }
  },
];

export const locationsIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const [location] = await Location.get({ l_id: id });
    const task = await FullTask.getByLocation(id);
    const t_id = task ? task.t_id : null;

    res.locals = getLocationLocals({
      location,
      t_id,
    });
    next();
  },
];
