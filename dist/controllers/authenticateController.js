import passport from "passport";
import { FullTask } from "../models/tasksModel.js";
export const loginGet = [
    (req, res) => {
        if (req.isAuthenticated())
            // only allow if not logged in
            throw new Error("Already Logged In");
        res.render("login", { errors: [] });
    },
];
export const loginPost = [
    (req, _res, next) => {
        if (req.isAuthenticated())
            // only allow if not logged in
            throw new Error("Already Logged In");
        next();
    },
    passport.authenticate("local", {
        // for manual authentication error handling
        failWithError: true,
    }),
    (req, res) => {
        if (req.user.u_role === "admin")
            res.redirect("/");
        else
            res.redirect("/current");
    },
    // specific error handler to show log in errors
    (err, _req, res, _next) => {
        res.status(401).render("login", { errors: [err.message] });
    },
];
export const logoutGet = [
    async (req, res) => {
        const user = req.user;
        const [task] = await FullTask.getCurrentByUser(user.u_id);
        if (task)
            await task.cancelTask();
        req.logOut(() => {
            res.redirect("/login");
        });
    },
];
