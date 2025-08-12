import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import type { ValidationError } from "express-validator";

export function checkValidation(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const errors = validationResult(req);
  if (errors.isEmpty()) next();
  else next(errors.array());
}

export function standardiseError(error: ValidationError[] | Error) {
  return error instanceof Error
    ? [error.message]
    : error.map((e) => String(e.msg));
}
