import type { NextFunction, Request, Response } from "express";
import Order, { ProductOrder } from "../models/ordersModel.ts";
import {
  checkValidation,
  validateInt,
  validateIntArr,
  validateOType,
} from "../middlewares/validate.ts";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import { createOrder } from "../services/orders.ts";
import mapToView from "../utils/mapToView.ts";

export const ordersGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [incoming, outgoing] = await Promise.all([
      Order.getByComplete(true, "IN"),
      Order.getByComplete(true, "OUT"),
    ]);

    res.locals = getDisplayLocals(
      [
        {
          title: "Completed Incoming Orders",
          tableData: incoming,
        },
        {
          title: "Completed Outgoing Orders",
          tableData: outgoing,
        },
      ],
      { searchBar: true, addBtn: true },
    );
    next();
  },
];

export const ordersNewGet = [
  (_req: Request, res: Response) => {
    res.render("orderForm");
  },
];

export const ordersNewPost = [
  validateOType(),
  ...validateIntArr("products"),
  ...validateIntArr("stock"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { o_type, products, stock } = matchedData<{
      o_type: "IN" | "OUT";
      products: string[];
      stock: string[];
    }>(req);

    // validate array lengths & convert to integers
    if (products.length !== stock.length)
      throw new Error("Products & Stock must be of equal length");
    const parsedProducts = products.map((product) => Number.parseInt(product));
    const parsedStock = stock.map((stock) => Number.parseInt(stock));

    const { order } = await createOrder(o_type, parsedProducts, parsedStock);
    res.redirect(`/orders/${String(order.o_id)}`);
  },
];

export const ordersIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);

    const { products, ...order } = await ProductOrder.getFull({ o_id: id });

    res.locals = getDisplayLocals([
      { title: `Order ${String(id)}`, tableData: [order] },
      { title: "Products", tableData: mapToView(products) },
    ]);
    next();
  },
];
