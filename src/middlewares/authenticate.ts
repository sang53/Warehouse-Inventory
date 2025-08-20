import type { NextFunction, Request, Response } from "express";
import User from "../models/usersModel.ts";

export type AuthenticatedRequest = Request & { user: User };

export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.isAuthenticated();
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (isAuthenticated(req)) next();
  else res.redirect("/login");
}
