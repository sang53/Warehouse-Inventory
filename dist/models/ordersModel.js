import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
import extractKeys from "../utils/extractKeys.js";
export default class Order {
    o_id;
    completed;
    o_type;
    placed;
    t_ids;
    static Query = `orders AS a
    LEFT JOIN o_t AS b
    ON a.o_id = b.o_id`;
    constructor(data, tasks) {
        this.o_id = data.o_id;
        this.o_type = data.o_type;
        this.placed = GeneralModel.parseTimestamp(data.placed);
        this.completed = GeneralModel.parseTimestamp(data.completed);
        this.t_ids = tasks;
    }
    static async get(data, limit = 3) {
        const output = await GeneralModel.getJoin(Order.Query, "a", {
            conditions: data,
            limit,
        });
        const orders = this.#processOutput(output);
        return GeneralModel.parseOutput(orders, `Order Not Found`);
    }
    static async getAll() {
        const output = await GeneralModel.getJoin(Order.Query, "a", {
            order: ["o_id"],
            limit: null,
        });
        return this.#processOutput(output);
    }
    static async getByTask(t_id, client) {
        const [orderData] = await GeneralModel.get("o_t", {
            conditions: { t_id },
        }, client);
        if (!orderData) {
            console.error(`Task ${String(t_id)} not associated with order`);
            throw new Error("System Error");
        }
        const output = await GeneralModel.getJoin(this.Query, "a", {
            conditions: { o_id: orderData.o_id },
            limit: null,
        }, client);
        const orders = this.#processOutput(output);
        const [order] = GeneralModel.parseOutput(orders);
        return order;
    }
    static async getByComplete(complete, o_type) {
        const query = `
    SELECT * FROM ${this.Query} 
    WHERE a.completed IS ${complete ? "NOT" : ""} NULL
    ${o_type ? "AND a.o_type = $1" : ""}
    ORDER BY a.completed DESC;`;
        const { rows } = await db.query(query, o_type ? [o_type] : []);
        return this.#processOutput(rows);
    }
    async addTask(t_id, client) {
        await GeneralModel.create("o_t", {
            o_id: this.o_id,
            t_id,
        }, client);
        return this;
    }
    async complete(client) {
        const completed = await GeneralModel.timestamp("orders", "completed", { o_id: this.o_id }, true, client);
        this.completed = GeneralModel.parseTimestamp(completed);
        return this;
    }
    static #getTaskIds(output) {
        return output.reduce((map, { o_id, t_id }) => {
            if (map.has(o_id))
                map.get(o_id)?.push(t_id);
            else
                map.set(o_id, [t_id]);
            return map;
        }, new Map());
    }
    static #processOutput(output) {
        const taskIds = this.#getTaskIds(output);
        return output
            .map((orderData) => {
            if (!taskIds.has(orderData.o_id))
                return null;
            const order = new Order(orderData, taskIds.get(orderData.o_id));
            taskIds.delete(orderData.o_id);
            return order;
        })
            .filter((order) => order !== null);
    }
    getTable(keys = ["o_id", "o_type", "placed", "completed"], t_ids = true) {
        return {
            ...extractKeys(this, keys),
            t_ids: t_ids ? this.t_ids?.join(", ") : undefined,
        };
    }
}
export class ProductOrder extends Order {
    products;
    constructor(data, products, stock, tasks) {
        super(data, tasks);
        this.products = this.#getProductMap(products, stock);
    }
    static async getProducts(order, client) {
        const products = await this.#queryProducts(order.o_id, client);
        return new ProductOrder(order, products.map(({ p_id }) => p_id), products.map(({ stock }) => stock));
    }
    static async create({ o_type, t_id }, products, stock, client) {
        // create order in DB
        const output = await GeneralModel.create("orders", { o_type }, client);
        const order = new ProductOrder({ ...output }, products, stock);
        // add products/stocks & first task
        const placeholders = products
            .map((_, idx) => {
            return `($${String(idx * 3 + 1)}, $${String(idx * 3 + 2)}, $${String(idx * 3 + 3)})`;
        })
            .join(", ");
        const values = products.flatMap((p_id, idx) => {
            if (!stock[idx])
                throw new Error(`Invalid Number of Products/Stocks`);
            return [order.o_id, p_id, stock[idx]];
        });
        const query = `
      INSERT INTO o_p (o_id, p_id, stock)
      VALUES ${placeholders};`;
        await Promise.all([
            client.query(query, values),
            order.addTask(t_id, client),
        ]);
        // create products map
        order.products = new Map(products.map((p_id, idx) => {
            if (!stock[idx])
                throw new Error("System Error");
            return [p_id, stock[idx]];
        }));
        return order;
    }
    static async getFull(data) {
        let order;
        if (data.t_id)
            order = await Order.getByTask(data.t_id);
        else
            [order] = await Order.get(data);
        const products = await this.#queryProducts(order.o_id);
        return new ProductOrder(order, products.map(({ p_id }) => p_id), products.map(({ stock }) => stock), order.t_ids);
    }
    static async validateProducts(products, client) {
        // make sure all p_ids are in DB
        return await GeneralModel.getArray("products", "p_id", products, {
            limit: null,
        }, client);
    }
    static async #queryProducts(o_id, client) {
        return await GeneralModel.get("o_p", {
            conditions: { o_id },
            limit: null,
        }, client);
    }
    #getProductMap(products, stock) {
        return new Map(products.map((p_id, idx) => {
            if (stock[idx])
                return [p_id, stock[idx]];
            else
                return [NaN, NaN];
        }));
    }
}
