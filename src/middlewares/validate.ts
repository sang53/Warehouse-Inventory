import type { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";

export function validateAlphaNum(field: string) {
  return body(field)
    .notEmpty()
    .withMessage(`${field} Required`)
    .trim()
    .isAlphanumeric(undefined, { ignore: " " })
    .escape()
    .withMessage(`${field} Must Be Alphanumeric`);
}

export function validateInt(field: string) {
  const errorMsg = `${field} Must Be Integer`;
  return [
    body(field).optional().toInt().isInt().withMessage(errorMsg),
    param(field).optional().toInt().isInt().withMessage(errorMsg),
  ];
}

export function validateIntArr(field: string) {
  return [
    body(field).isArray({ min: 1 }).withMessage(`${field} must not be empty`),
    body(field + ".*")
      .toInt()
      .isInt({ min: 1 })
      .withMessage(`${field} must be integers > 0`),
  ];
}

export function validateOType(field: string = "o_type") {
  return body(field)
    .isIn(["IN", "OUT"])
    .withMessage("Order Type must be IN or OUT");
}

export function checkValidation(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const errors = validationResult(req);
  if (errors.isEmpty()) next();
  else next(errors.array());
}
