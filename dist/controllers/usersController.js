import User from "../models/usersModel.js";
import { checkValidation, validateAlphaNum, validateInt, validatePassword, validateURole, } from "../middlewares/validate.js";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import getUserLocals from "../getLocals/getUserLocals.js";
import { ensureRole } from "../middlewares/authenticate.js";
import getUserForm from "../getLocals/getUserForm.js";
import { FullTask } from "../models/tasksModel.js";
import extractKeys from "../utils/extractKeys.js";
import Order from "../models/ordersModel.js";
export const usersGet = [
    async (_req, res, next) => {
        const users = await User.getAll();
        const userData = await Promise.all(users.map(async (user) => addCurrentTaskOrder(user)));
        res.locals = getDisplayLocals([
            {
                title: "All Users",
                tableData: userData,
            },
        ], { searchBar: true, addBtn: true });
        next();
        async function addCurrentTaskOrder(user) {
            const plainUser = extractKeys(user, ["u_id", "u_name", "u_role"]);
            const [task] = await FullTask.getCurrentByUser(user.u_id);
            if (!task)
                return { ...plainUser, t_id: null, o_id: null };
            const { o_id } = await Order.getByTask(task.t_id);
            return { ...plainUser, t_id: task.t_id, o_id };
        }
    },
];
export const usersIDGet = [
    validateInt("id"),
    checkValidation,
    async (req, res, next) => {
        const { id } = matchedData(req);
        // retrieve user from database
        const [user] = await User.get({ u_id: id });
        if (!user)
            throw new Error(`User ${String(id)} Not Found`);
        // retrieve previous tasks
        const tasks = await FullTask.getByRels({ u_id: id }, null);
        // retrieve current task
        const [currentTask] = await FullTask.getCurrentByUser(user.u_id);
        const t_id = currentTask ? currentTask.t_id : null;
        res.locals = getUserLocals({ user, t_id, tasks });
        next();
    },
];
export const usersNewGet = [
    ensureRole(),
    (_req, res, next) => {
        res.locals = getUserForm();
        next();
    },
];
export const usersNewPost = [
    ensureRole(),
    validateAlphaNum("u_name"),
    validateAlphaNum("username"),
    ...validatePassword(),
    ...validateURole(),
    checkValidation,
    async (req, res) => {
        const { passwordConfirm, ...userData } = matchedData(req);
        if (passwordConfirm !== userData.password)
            throw new Error("Passwords must match");
        const user = await User.create(userData);
        res.redirect(`/users/id/${String(user.u_id)}`);
    },
];
