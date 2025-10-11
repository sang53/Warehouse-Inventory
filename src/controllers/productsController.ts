import type { NextFunction, Request, Response } from "express";
import Product from "../models/productsModel.ts";
import { matchedData } from "express-validator";
import {
  checkValidation,
  validateAlphaNum,
  validateInt,
} from "../middlewares/validate.ts";
import { T_IN } from "../config/tableTypes.ts";
import getDisplayLocals from "../utils/getLocals/getDisplayLocals.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";
import { ensureRole } from "../middlewares/authenticate.ts";

export const productsGet = [
  async (_req: Request, res: Response, next: NextFunction) => {
    const [id, net] = await Promise.all([
      Product.getAllStock("p_id", 50),
      Product.getAllStock("net_stock"),
    ]);
    res.locals = getDisplayLocals([
      {
        title: "All Products",
        tableData: id,
      },
      {
        title: "Products by Net Stock",
        tableData: net,
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
    const product = await Product.create(matchedData<T_IN["PRODUCTS"]>(req));
    res.redirect(`/products/${String(product.p_id)}`);
  },
];

export const productsIDGet = [
  ...validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const product = (await Product.get({ p_id: id }))[0];

    res.locals = getDisplayLocals([
      {
        title: `Product ${String(product.p_id)}`,
        tableData: [product],
      },
    ]);
    next();
  },
];
