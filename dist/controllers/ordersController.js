import Order, { ProductOrder } from "../models/ordersModel.js";
import { checkValidation, validateInt, validateIntArr, validateOType, } from "../middlewares/validate.js";
import { matchedData } from "express-validator";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import { createOrder } from "../services/orders.js";
import mapToView from "../utils/mapToView.js";
export const ordersGet = [
    async (_req, res, next) => {
        const orders = await Order.getAll();
        res.locals = getDisplayLocals([
            {
                title: "All Orders",
                tableData: orders.map((order) => order.getTable()),
            },
        ], { searchBar: true, addBtn: true });
        next();
    },
];
export const ordersCompleteGet = [
    async (_req, res, next) => {
        const [inOrders, outOrders] = await Promise.all([
            Order.getByComplete(true, "IN"),
            Order.getByComplete(true, "OUT"),
        ]);
        res.locals = getDisplayLocals([
            {
                title: "Incoming Orders",
                tableData: inOrders.map((order) => order.getTable()),
            },
            {
                title: "Outgoing Orders",
                tableData: outOrders.map((order) => order.getTable()),
            },
        ]);
        next();
    },
];
export const ordersIncompleteGet = [
    async (_req, res, next) => {
        const [inOrders, outOrders] = await Promise.all([
            Order.getByComplete(false, "IN"),
            Order.getByComplete(false, "OUT"),
        ]);
        res.locals = getDisplayLocals([
            {
                title: "Incoming Orders",
                tableData: inOrders.map((order) => order.getTable()),
            },
            {
                title: "Outgoing Orders",
                tableData: outOrders.map((order) => order.getTable()),
            },
        ]);
        next();
    },
];
export const ordersNewGet = [
    (_req, res) => {
        res.render("orderForm");
    },
];
export const ordersNewPost = [
    ...validateOType(),
    ...validateIntArr("products"),
    ...validateIntArr("stock"),
    checkValidation,
    async (req, res) => {
        const { o_type, products, stock } = matchedData(req);
        // validate array lengths & convert to integers
        if (products.length !== stock.length)
            throw new Error("Products & Stock must be of equal length");
        const parsedProducts = products.map((product) => Number.parseInt(product));
        const parsedStock = stock.map((stock) => Number.parseInt(stock));
        const { order } = await createOrder(o_type, parsedProducts, parsedStock);
        res.redirect(`/orders/id/${String(order.o_id)}`);
    },
];
export const ordersIDGet = [
    validateInt("id"),
    checkValidation,
    async (req, res, next) => {
        const { id } = matchedData(req);
        const { products, ...order } = await ProductOrder.getFull({ o_id: id });
        res.locals = getDisplayLocals([
            {
                title: `Order ${String(id)}`,
                tableData: [{ ...order, t_ids: order.t_ids?.join(", ") }],
            },
            { title: "Products", tableData: mapToView(products) },
        ]);
        next();
    },
];
