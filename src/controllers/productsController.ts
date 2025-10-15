import type { NextFunction, Request, Response } from "express";
import Product from "../models/productsModel.ts";
import { matchedData } from "express-validator";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
} from "../middlewares/validate.ts";
import getDisplayLocals from "../getLocals/getDisplayLocals.ts";
import getFormLocals from "../getLocals/getFormLocals.ts";
import { ensureRole } from "../middlewares/authenticate.ts";

export const productsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [id, net] = await Promise.all([
      Product.getAllStock("p_id", 50),
      Product.getAllStock("net_stock"),
    ]);
    res.locals = getDisplayLocals([
      {
        title: "Products by Net Stock",
        tableData: net,
      },
      {
        title: "All Products",
        tableData: id,
      },
    ]);
    next();
  },
];

export const productsNewGet = [
  ensureRole(),
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals = getFormLocals({
      title: "New Product",
      action: "/products/new",
      field: "PRODUCTS",
    });
    next();
  },
];

export const productsNewPost = [
  ensureRole(),
  validateAlphaNum("p_name"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { p_name } = matchedData<{ p_name: string }>(req);
    const product = await Product.create({ p_name });
    res.redirect(`/products/${String(product.p_id)}`);
  },
];

export const productsIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const product = await Product.getStockByProduct(id);

    res.locals = getDisplayLocals([
      {
        title: `Product ${String(product.p_id)}`,
        tableData: [product],
      },
    ]);
    next();
  },
];
