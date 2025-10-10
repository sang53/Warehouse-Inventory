import type { NextFunction, Request, Response } from "express";
import passport from "passport";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";

export const loginGet = [
  (req: Request, res: Response) => {
    if (req.isAuthenticated()) throw new Error("Already Logged In");
    res.render("login");
  },
];

export const loginPost = [
  // force log out if currently logged in
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) req.logOut(next);
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
  (req: AuthenticatedRequest, res: Response) => {
    req.logOut(() => {
      res.redirect("/login");
    });
  },
];
