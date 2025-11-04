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
    res.locals = getDisplayLocals(
      [
        {
          title: "All Products",
          tableData: await Product.getAllStock("net_stock"),
        },
      ],
      { searchBar: true, addBtn: true },
    );
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
    res.redirect(`/products/id/${String(product.p_id)}`);
  },
];

export const productsIDGet = [
  validateInt("id"),
  checkValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = matchedData<{ id: number }>(req);
    const [product, palletsLocations] = await Promise.all([
      Product.getStockByProduct(id),
      Product.getPalletLocation(id),
    ]);

    const inLocations = palletsLocations.filter(({ l_id }) => l_id);
    const offLocations = palletsLocations
      .filter(({ l_id }) => !l_id)
      .map(({ pa_id, stock }) => ({
        pa_id,
        stock,
      }));

    res.locals = getDisplayLocals([
      {
        title: `Product ${String(product.p_id)}`,
        tableData: [product],
      },
      {
        title: "Stock In Locations",
        tableData: inLocations,
      },
      {
        title: "Floating Stock",
        tableData: offLocations,
      },
    ]);
    next();
  },
];
