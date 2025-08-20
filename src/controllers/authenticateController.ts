import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";
import getFormLocals from "../utils/getLocals/getFormLocals.ts";

export const loginGet = [
  (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) res.redirect("/");
    res.locals = getFormLocals({
      title: "Log In",
      action: "/login",
      field: "LOGIN",
    });
    next();
  },
];

export const loginPost = [
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req: AuthenticatedRequest, res: Response) => {
    res.redirect(`/users/${String(req.user.u_id)}/tasks`);
  },
];

export const logoutGet = [
  (req: Request, res: Response) => {
    req.logOut(() => {
      res.redirect("/login");
    });
  },
];
