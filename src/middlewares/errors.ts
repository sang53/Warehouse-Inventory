import type { NextFunction, Request, Response } from "express";
import type { ValidationError } from "express-validator";

function isValidationErrorArr(error: unknown): error is ValidationError[] {
  return Array.isArray(error) && error.every((err) => err && "msg" in err);
}

export function parseError(
  error: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (error instanceof Error) next([error.message]);
  else if (isValidationErrorArr(error))
    next(
      error.map((err) =>
        typeof err.msg === "string" ? err.msg : "Unknown Validation Error",
      ),
    );
  else next(`Unknown system error: ${String(error)}`);
}

export function renderErrorPage(
  errors: string[],
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  res.render("errorPage", {
    errors,
  });
}
