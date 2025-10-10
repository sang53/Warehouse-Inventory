import type { NextFunction, Request, Response } from "express";
import User from "../models/usersModel.ts";
import { UserType } from "../config/tableTypes.ts";

export interface AuthenticatedRequest extends Request {
  user: User;
}

export function isAuthenticated(req: Request): req is AuthenticatedRequest {
  return req.isAuthenticated();
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // redirect to login page if not logged in
  if (isAuthenticated(req)) next();
  else res.redirect("/login");
}

export function ensureRole(u_roles: UserType[] = [], admin: boolean = true) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    // make sure user has correct role or admin acess
    if (!u_roles.includes(user.u_role) && (!admin || user.u_role !== "admin"))
      throw new Error(`Access Denied. Current Role: ${user.u_role}`);

    next();
  };
}
