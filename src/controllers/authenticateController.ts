import type { Request, Response } from "express";
import passport from "passport";
import { AuthenticatedRequest } from "../middlewares/authenticate.ts";

export const loginGet = [
  (req: Request, res: Response) => {
    if (req.isAuthenticated()) res.redirect("/");
    else res.render("login");
  },
];

export const loginPost = [
  // TODO: add proper message when log in failure
  passport.authenticate("local", { failureRedirect: "/login" }),
  (_req: AuthenticatedRequest, res: Response) => {
    res.redirect("/");
    // res.redirect(`/users/${String(req.user.u_id)}/tasks`);
  },
];

export const logoutGet = [
  (req: Request, res: Response) => {
    req.logOut(() => {
      res.redirect("/login");
    });
  },
];
