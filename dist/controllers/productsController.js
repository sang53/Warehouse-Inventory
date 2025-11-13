import Product from "../models/productsModel.js";
import { matchedData } from "express-validator";
import { checkValidation, validateAlphaNum, validateInt, } from "../middlewares/validate.js";
import getDisplayLocals from "../getLocals/getDisplayLocals.js";
import getFormLocals from "../getLocals/getFormLocals.js";
import { ensureRole } from "../middlewares/authenticate.js";
export const productsGet = [
    async (_req, res, next) => {
        res.locals = getDisplayLocals([
            {
                title: "All Products",
                tableData: await Product.getAllStock("net_stock"),
            },
        ], { searchBar: true, addBtn: true });
        next();
    },
];
export const productsNewGet = [
    ensureRole(),
    (_req, res, next) => {
        res.locals = getFormLocals({
            title: "New Product",
            action: "/products/new",
            field: "PRODUCTS",
        });
        next();
    },
];
export const productsNewPost = [
    ensureRole(),
    validateAlphaNum("p_name"),
    checkValidation,
    async (req, res) => {
        const { p_name } = matchedData(req);
        const product = await Product.create({ p_name });
        res.redirect(`/products/id/${String(product.p_id)}`);
    },
];
export const productsIDGet = [
    validateInt("id"),
    checkValidation,
    async (req, res, next) => {
        const { id } = matchedData(req);
        const [product, palletsLocations] = await Promise.all([
            Product.getStockByProduct(id),
            Product.getPalletLocation(id),
        ]);
        const inLocations = palletsLocations.filter(({ l_id }) => l_id);
        const offLocations = palletsLocations
            .filter(({ l_id }) => !l_id)
            .map(({ pa_id, stock }) => ({
            pa_id,
            stock,
        }));
        res.locals = getDisplayLocals([
            {
                title: `Product ${String(product.p_id)}`,
                tableData: [product],
            },
            {
                title: "Stock in Locations",
                tableData: inLocations,
            },
            {
                title: "Stock to Process",
                tableData: offLocations,
            },
        ]);
        next();
    },
];
