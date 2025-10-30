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
  const errorMsg = `${field} must be an integer > 0`;
  return param(field).toInt().isInt({ min: 1 }).withMessage(errorMsg);
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
  res: Response,
  next: NextFunction,
) {
  const errors = validationResult(req);
  if (errors.isEmpty()) next();
  else {
    res.status(400);
    next(errors.array());
  }
}
