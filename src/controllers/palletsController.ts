import type { NextFunction, Request, Response } from "express";
import Pallet, { ProductPallet } from "../models/palletsModel.ts";
import { matchedData } from "express-validator";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";
import { getPalletLocals } from "../utils/getLocals/getPalletLocals.ts";
import Location from "../models/locationsModel.ts";

export const palletsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals({
      title: "All Pallets",
      tableData: await Pallet.getAll(),
    });
    next();
  },
];

export const palletsPost = [
  async (_req: Request, res: Response) => {
    const pallet = await Pallet.create();
    res.redirect(`/pallets/${String(pallet.pa_id)}`);
  },
];

export const palletsIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const pallet = await ProductPallet.get({ pa_id: id });
    const { l_name } = (await Location.get({ pa_id: id }))[0];

    res.locals = getPalletLocals({ pallet, l_name });
    next();
  },
];

export const palletsIDEditGet = [
  ...validateInt("pa_id"),
  checkValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const { pa_id } = matchedData<{ pa_id: number }>(req);
    res.locals = getFormLocals({
      title: `Edit Pallet ${String(pa_id)}`,
      action: `pallets/${String(pa_id)}/edit`,
      field: "PALLETS",
    });
    next();
  },
];
