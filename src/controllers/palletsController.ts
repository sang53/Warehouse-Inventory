import type { NextFunction, Request, Response } from "express";
import Pallet from "../models/palletsModel.ts";
import { matchedData } from "express-validator";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { T_OUT } from "../config/tableTypes.ts";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";

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
    const pallet = await Pallet.get(id);

    res.locals = getDisplayLocals({
      title: `Pallet ${String(id)}`,
      tableData: [pallet],
    });
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

export const palletsIDEditPost = [
  ...validateInt("pa_id"),
  ...validateInt("p_id"),
  ...validateInt("stock"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { pa_id, p_id, stock } = matchedData<T_OUT["PA_P_PA"]>(req);
    const pallet = await Pallet.get(pa_id);
    await pallet.setStock(p_id, stock);
    res.redirect(`/pallets/${String(pa_id)}`);
  },
];
