import type { NextFunction, Request, Response } from "express";
import User, { UserType } from "../models/usersModel.ts";

export interface AuthenticatedRequest extends Request {
  user: User;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // redirect to login page if not logged in
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
}

// returns middleware function that only allows given roles &| admin
export function ensureRole(u_roles: UserType[] = [], admin: boolean = true) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    // make sure user has correct role or admin acess
    if (!u_roles.includes(user.u_role) && (!admin || user.u_role !== "admin"))
      throw new Error(`Access Denied. Current Role: ${user.u_role}`);

    next();
  };
}
