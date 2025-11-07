import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { FullTask } from "../models/tasksModel.js";

export const loginGet = [
  (req: Request, res: Response) => {
    if (req.isAuthenticated())
      // only allow if not logged in
      throw new Error("Already Logged In");
    res.render("login", { errors: [] });
  },
];

export const loginPost = [
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.isAuthenticated())
      // only allow if not logged in
      throw new Error("Already Logged In");
    next();
  },

  passport.authenticate("local", {
    // for manual authentication error handling
    failWithError: true,
  }),
  (req: AuthenticatedRequest, res: Response) => {
    if (req.user.u_role === "admin") res.redirect("/");
    else res.redirect("/current");
  },
  // specific error handler to show log in errors
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(401).render("login", { errors: [err.message] });
  },
];

export const logoutGet = [
  async (req: Request, res: Response) => {
    const user = (req as AuthenticatedRequest).user;
    const [task] = await FullTask.getCurrentByUser(user.u_id);

    if (task) await task.cancelTask();
    req.logOut(() => {
      res.redirect("/login");
    });
  },
];
