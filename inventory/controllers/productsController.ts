import type { NextFunction, Request, Response } from "express";
import {
  createProducts,
  getAllProducts,
  getProductById,
} from "../db/queries.ts";
import { FIELDS } from "../db/tableInfo.ts";
import { getFormData } from "../utils/general.ts";
import { body, matchedData, param } from "express-validator";
import { checkValidation, standardiseError } from "../utils/error.ts";
import type { ValidationError } from "express-validator";

export const productsGet = [
  async (_req: Request, res: Response) => {
    const tableData = await getAllProducts();
    res.render("display", {
      title: "All Products",
      category: "products",
      tableData,
      error: [],
    });
  },
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.render("display", {
      title: "All Products (Error)",
      category: "products",
      tableData: [],
      error: [error.message],
    });
  },
];

export const productsNewGet = [
  (_req: Request, res: Response) => {
    res.render("form", {
      title: "Add Product",
      fields: getFormData(FIELDS.PRODUCTS, ["text"]),
      action: "/products/new",
      error: [],
    });
  },
];

export const productsNewPost = [
  body("p_name")
    .notEmpty()
    .withMessage("Name required")
    .isAlphanumeric()
    .withMessage("Name must be alphanumeric")
    .escape(),
  body("price")
    .notEmpty()
    .withMessage("Price required")
    .isNumeric()
    .withMessage("Price must be numeric")
    .toFloat(),
  checkValidation,
  async (req: Request, res: Response) => {
    const product = matchedData<{ p_name: string; price: number }>(req);
    await createProducts([product]);
    res.redirect("/products");
  },
  (
    error: ValidationError[] | Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    res.render("form", {
      title: "Add Product",
      fields: getFormData(FIELDS.PRODUCTS, ["text"]),
      action: "/products/new",
      error: standardiseError(error),
    });
  },
];

export const productsIdGet = [
  param("id").isInt().withMessage("ID must be an integer"),
  checkValidation,
  async (req: Request, res: Response) => {
    const { id } = matchedData<{ id: number }>(req);
    const tableData = await getProductById(id);
    if (!tableData.length) throw new Error(`Product ${String(id)} Not Found`);
    res.render("display", {
      title: `Product ${String(id)}`,
      category: "products",
      tableData,
      error: [],
    });
  },
  (
    error: ValidationError[] | Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    res.render("display", {
      title: `Product (Error)`,
      category: "products",
      tableData: [],
      error: standardiseError(error),
    });
  },
];
