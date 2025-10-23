import type { NextFunction, Request, Response } from "express";
import Pallet, { ProductPallet } from "../models/palletsModel.ts";
import { matchedData } from "express-validator";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import { getPalletLocals } from "../getLocals/getPalletLocals.ts";
import Location from "../models/locationsModel.ts";

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

    const [pallet, [{ l_name }]] = await Promise.all([
      ProductPallet.get({ pa_id: id }),
      Location.get({ pa_id: id }),
    ]);

    res.locals = getPalletLocals({ pallet, l_name });
    next();
  },
];
