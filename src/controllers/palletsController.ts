import type { NextFunction, Request, Response } from "express";
import Pallet, { ProductPallet } from "../models/palletsModel.js";
import { matchedData } from "express-validator";
import { checkValidation, validateInt } from "../middlewares/validate.js";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import { getPalletLocals } from "../getLocals/getPalletLocals.js";
import Location from "../models/locationsModel.js";

export const palletsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals(
      [
        {
          title: "All Pallets",
          tableData: await Pallet.getAll(),
        },
      ],
      { searchBar: true },
    );
    next();
  },
];

export const palletsIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);

    const [palletData, locationData] = await Promise.allSettled([
      ProductPallet.get({ pa_id: id }),
      Location.get({ pa_id: id }),
    ]);

    if (palletData.status === "rejected")
      throw new Error(`Pallet ${String(id)} not found`);
    const location =
      locationData.status === "fulfilled" ? locationData.value[0] : null;

    res.locals = getPalletLocals({ pallet: palletData.value, location });
    next();
  },
];
