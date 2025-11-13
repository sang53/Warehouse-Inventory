import { getCurrentTask } from "../services/tasks.js";
import getCurrentLocals from "../getLocals/getCurrentLocals.js";
import Order, { ProductOrder } from "../models/ordersModel.js";
import Location from "../models/locationsModel.js";
import { FullTask } from "../models/tasksModel.js";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import extractKeys from "../utils/extractKeys.js";
export const indexGet = [
    async (_req, res, next) => {
        const [inOrders, outOrders, tasks, startedTasks] = await Promise.all([
            Order.getByComplete(false, "IN"),
            Order.getByComplete(false, "OUT"),
            FullTask.getByComplete(false),
            FullTask.getCurrentByUser(),
        ]);
        const taskKeys = [
            "t_id",
            "t_type",
            "placed",
            "started",
            "u_id",
            "pa_id",
            "l_id",
            "o_id",
        ];
        res.locals = getDisplayLocals([
            {
                title: "Started Tasks",
                tableData: startedTasks.map((task) => extractKeys(task, taskKeys)),
            },
            {
                title: "Current Tasks",
                tableData: tasks.map((task) => extractKeys(task, taskKeys)),
            },
            {
                title: "Current Incoming Orders",
                tableData: inOrders.map((order) => order.getTable(["o_id", "placed"])),
            },
            {
                title: "Current Outgoing Orders",
                tableData: outOrders.map((order) => order.getTable(["o_id", "placed"])),
            },
        ]);
        next();
    },
];
export const currentGet = [
    async (req, res, next) => {
        const user = req.user;
        // Prevent admins from being assigned tasks
        if (user.u_role === "admin") {
            res.redirect("/");
            return;
        }
        // get task or assign oldest available task
        const task = await getCurrentTask(user);
        if (task === null)
            throw new Error("No available tasks - report to team leader");
        // get current location of pallet
        let l_name;
        try {
            const [location] = await Location.get({ pa_id: task.pa_id });
            l_name = location.l_name;
        }
        catch {
            // task pallet is not in location (arrival or pick)
            l_name = "New Pallet";
        }
        // get product information of order
        const fullOrder = await ProductOrder.getFull({ t_id: task.t_id });
        res.locals = await getCurrentLocals({
            l_name,
            user,
            task,
            o_id: fullOrder.o_id,
            products: fullOrder.products,
        });
        next();
    },
];
