import type { NextFunction, Request, Response } from "express";
import Order from "../models/ordersModel.ts";
import { checkValidation, validateInt } from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";

export const ordersGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getDisplayLocals({
      title: "All Orders",
      tableData: await Order.getAll(),
    });
    next();
  },
];

export const ordersNewGet = [
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getFormLocals({
      title: "New Order",
      action: "/orders/new",
      field: "ORDERS",
    });
    next();
  },
];

export const ordersNewPost = [
  ...validateInt("p_id"),
  ...validateInt("stock"),
  checkValidation,
  async (req: Request, res: Response) => {
    const order = await Order.create(
      matchedData<{ p_id: number; stock: number }>(req),
    );
    res.redirect(`/orders/${String(order.o_id)}`);
  },
];

export const ordersIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const order = await Order.get(id);

    res.locals = getDisplayLocals({
      title: `Order ${String(id)}`,
      tableData: [order],
    });
    next();
  },
];
