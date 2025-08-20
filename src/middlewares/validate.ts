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
  return [
    body(field)
      .optional()
      .toInt()
      .isInt()
      .withMessage(`${field} Must Be Integer`),
    param(field)
      .optional()
      .toInt()
      .isInt()
      .withMessage(`${field} Must Be Integer`),
  ];
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
