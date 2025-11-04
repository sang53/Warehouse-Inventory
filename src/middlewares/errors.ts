import type { NextFunction, Request, Response } from "express";
import type { ValidationError } from "express-validator";

function isValidationErrorArr(error: unknown): error is ValidationError[] {
  return Array.isArray(error) && error.every((err) => err && "msg" in err);
}

export function parseError(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof Error) {
    if (res.statusCode === 200) res.status(400);
    next([error.message]);
  } else if (isValidationErrorArr(error)) {
    const err = error.map((err) =>
      typeof err.msg === "string" ? err.msg : "Unknown Validation Error",
    );
    res.status(400);
    next(err);
  } else {
    res.status(500);
    next(`Unknown system error: ${String(error)}`);
  }
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
