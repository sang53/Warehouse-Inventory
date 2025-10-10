import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import {
  AuthenticatedRequest,
  ensureAuthenticated,
} from "../middlewares/authenticate.ts";
import { FullTask } from "../models/tasksModel.ts";

export const loginGet = [
  (req: Request, res: Response) => {
    if (req.isAuthenticated()) throw new Error("Already Logged In");
    res.render("login", { errors: [] });
  },
];

export const loginPost = [
  // only allow if logged in
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) throw new Error("Already Logged In");
    else next();
  },

  passport.authenticate("local", {
    // error caught within router
    failWithError: true,
  }),
  (req: AuthenticatedRequest, res: Response) => {
    if (req.user.u_role === "admin") res.redirect("/");
    else res.redirect("/current");
  },
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res
      .status(401)
      .render("login", { errors: [err.message || "Login Unsuccessful"] });
  },
];

export const logoutGet = [
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    // unassign task from user if assigned
    await FullTask.cancelTask((req as AuthenticatedRequest).user.u_id);
    req.logOut(() => {
      res.redirect("/login");
    });
  },
];
