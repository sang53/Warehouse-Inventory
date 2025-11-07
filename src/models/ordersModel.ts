import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
import { PoolClient } from "pg";
import extractKeys from "../utils/extractKeys.js";

export interface InOrder {
  o_type: OrderType;
  t_id: number;
}

export interface OutOrder extends InOrder {
  o_id: number;
  completed: string | null;
  placed: string;
}

interface OrderInputs {
  o_id: number;
  completed: string | null;
  placed: string;
  o_type: OrderType;
}

export type OrderType = "IN" | "OUT";

export default class Order {
  o_id: number;
  completed: string | null;
  o_type: OrderType;
  placed: string;
  t_ids?: number[];

  static Query = `orders AS a
    LEFT JOIN o_t AS b
    ON a.o_id = b.o_id`;

  constructor(data: OrderInputs, tasks?: number[]) {
    this.o_id = data.o_id;
    this.o_type = data.o_type;
    this.placed = GeneralModel.parseTimestamp(data.placed);
    this.completed = GeneralModel.parseTimestamp(data.completed);
    this.t_ids = tasks;
  }

  static async get(
    data: Omit<Partial<OutOrder>, "t_id">,
    limit: number | null = 3,
  ) {
    const output = await GeneralModel.getJoin<OutOrder>(Order.Query, "a", {
      conditions: data,
      limit,
    });

    const orders = this.#processOutput(output);
    return GeneralModel.parseOutput(orders, `Order Not Found`);
  }

  static async getAll() {
    const output = await GeneralModel.getJoin<OutOrder>(Order.Query, "a", {
      order: ["o_id"],
      limit: null,
    });
    return this.#processOutput(output);
  }

  static async getByTask(t_id: number, client?: PoolClient) {
    const [orderData] = await GeneralModel.get(
      "o_t",
      {
        conditions: { t_id },
      },
      client,
    );

    if (!orderData) {
      console.error(`Task ${String(t_id)} not associated with order`);
      throw new Error("System Error");
    }

    const output = await GeneralModel.getJoin<OutOrder>(
      this.Query,
      "a",
      {
        conditions: { o_id: orderData.o_id },
        limit: null,
      },
      client,
    );

    const orders = this.#processOutput(output);
    const [order] = GeneralModel.parseOutput(orders);
    return order;
  }

  static async getByComplete(complete: boolean, o_type?: OrderType) {
    const query = `
    SELECT * FROM ${this.Query} 
    WHERE a.completed IS ${complete ? "NOT" : ""} NULL
    ${o_type ? "AND a.o_type = $1" : ""}
    ORDER BY a.completed DESC;`;

    const { rows } = await db.query<OutOrder>(query, o_type ? [o_type] : []);
    return this.#processOutput(rows);
  }

  async addTask(t_id: number, client: PoolClient) {
    await GeneralModel.create(
      "o_t",
      {
        o_id: this.o_id,
        t_id,
      },
      client,
    );
    return this;
  }

  async complete(client: PoolClient) {
    const completed = await GeneralModel.timestamp(
      "orders",
      "completed",
      { o_id: this.o_id },
      true,
      client,
    );
    this.completed = GeneralModel.parseTimestamp(completed);
    return this;
  }

  static #getTaskIds(output: OutOrder[]) {
    return output.reduce((map, { o_id, t_id }) => {
      if (map.has(o_id)) map.get(o_id)?.push(t_id);
      else map.set(o_id, [t_id]);
      return map;
    }, new Map<number, number[]>());
  }

  static #processOutput(output: OutOrder[]) {
    const taskIds = this.#getTaskIds(output);
    return output
      .map((orderData) => {
        if (!taskIds.has(orderData.o_id)) return null;
        const order = new Order(orderData, taskIds.get(orderData.o_id));
        taskIds.delete(orderData.o_id);
        return order;
      })
      .filter((order) => order !== null);
  }

  getTable(
    keys: (keyof this)[] = ["o_id", "o_type", "placed", "completed"],
    t_ids: boolean = true,
  ) {
    return {
      ...extractKeys(this, keys),
      t_ids: t_ids ? this.t_ids?.join(", ") : undefined,
    };
  }
}

export class ProductOrder extends Order {
  products: Map<number, number>;

  constructor(
    data: OrderInputs,
    products: number[],
    stock: number[],
    tasks?: number[],
  ) {
    super(data, tasks);
    this.products = this.#getProductMap(products, stock);
  }

  static async getProducts(order: Order, client?: PoolClient) {
    const products = await this.#queryProducts(order.o_id, client);

    return new ProductOrder(
      order,
      products.map(({ p_id }) => p_id),
      products.map(({ stock }) => stock),
    );
  }

  static async create(
    { o_type, t_id }: InOrder,
    products: number[],
    stock: number[],
    client: PoolClient,
  ) {
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
      if (!stock[idx]) throw new Error(`Invalid Number of Products/Stocks`);
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
    order.products = new Map(
      products.map((p_id, idx) => {
        if (!stock[idx]) throw new Error("System Error");
        return [p_id, stock[idx]];
      }),
    );
    return order;
  }

  static async getFull(data: Partial<OutOrder>) {
    let order: Order;
    if (data.t_id) order = await Order.getByTask(data.t_id);
    else [order] = await Order.get(data);
    const products = await this.#queryProducts(order.o_id);

    return new ProductOrder(
      order,
      products.map(({ p_id }) => p_id),
      products.map(({ stock }) => stock),
      order.t_ids,
    );
  }

  static async validateProducts(products: number[], client?: PoolClient) {
    // make sure all p_ids are in DB
    return await GeneralModel.getArray(
      "products",
      "p_id",
      products,
      {
        limit: null,
      },
      client,
    );
  }

  static async #queryProducts(o_id: number, client?: PoolClient) {
    return await GeneralModel.get(
      "o_p",
      {
        conditions: { o_id },
        limit: null,
      },
      client,
    );
  }

  #getProductMap(products: number[], stock: number[]) {
    return new Map(
      products.map((p_id, idx) => {
        if (stock[idx]) return [p_id, stock[idx]];
        else return [NaN, NaN];
      }),
    );
  }
}
