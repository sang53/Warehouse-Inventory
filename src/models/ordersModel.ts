import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";
import { PoolClient } from "pg";

export interface InOrder {
  o_type: OrderType;
  t_id: number;
}

export interface OutOrder extends InOrder {
  o_id: number;
  completed: string | null;
  placed: string;
}

export type OrderType = "IN" | "OUT";

export default class Order {
  o_id: number;
  completed: string | null;
  o_type: OrderType;
  placed: string;
  t_id: number;

  static Query = `orderss AS a
    LEFT JOIN o_t AS b
    ON a.o_id = b.o_id`;

  constructor(data: OutOrder) {
    this.o_id = data.o_id;
    this.completed = data.completed;
    this.o_type = data.o_type;
    this.placed = data.placed;
    this.t_id = data.t_id;
  }

  static async get(data: Partial<OutOrder>, limit?: number | null) {
    const output = await GeneralModel.getJoin<OutOrder>(Order.Query, "a", {
      conditions: data,
      limit,
    });
    const orders = output.map((order) => new Order(order));
    return GeneralModel.parseOutput(orders, `Order Not Found`);
  }

  static async getAll() {
    const output = await GeneralModel.getJoin<OutOrder>(Order.Query, "a", {
      limit: 50,
      desc: true,
      order: ["placed"],
    });
    return output.map((order) => new Order(order));
  }

  static async getByTask(t_id: number) {
    const query = `SELECT * FROM o_t a
    JOIN orders b
    ON a.o_id = b.o_id;`;
    const output = await GeneralModel.getJoin<OutOrder>(query, "a", {
      conditions: { t_id },
    });
    const [order] = GeneralModel.parseOutput(
      output,
      `Task ${String(t_id)} not associated with Order`,
    );

    return new Order(order);
  }

  static async getByComplete(complete: boolean, o_type?: OrderType) {
    const query = `SELECT * FROM o_t a
    JOIN orders b
    ON a.o_id = b.o_id
    WHERE b.completed IS ${complete ? "NOT" : ""} NULL
    ${o_type ? "AND b.o_type = $1" : ""}
    ORDER BY b.placed
    LIMIT 20;`;

    const output = await db.query<OutOrder>(query, o_type ? [o_type] : []);
    return output.rows.map((order) => new Order(order));
  }

  async addTask(t_id: number, client: PoolClient) {
    const output = await GeneralModel.create(
      "o_t",
      {
        o_id: this.o_id,
        t_id,
      },
      client,
    );
    this.t_id = output.t_id;
    return this;
  }

  async complete() {
    this.completed = await GeneralModel.timestamp(
      "orders",
      "completed",
      { o_id: this.o_id },
      true,
    );
    return this;
  }
}

export class ProductOrder extends Order {
  products: Map<number, number>;

  constructor(data: OutOrder, products: number[], stock: number[]) {
    super(data);
    this.products = this.#getProductMap(products, stock);
  }

  static async getProducts(order: Order) {
    const products = await this.#queryProducts(order.o_id);

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
    const order = new ProductOrder({ ...output, t_id }, products, stock);

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
    const [order] = await this.get(data);
    const products = await this.#queryProducts(order.o_id);

    return new ProductOrder(
      order,
      products.map(({ p_id }) => p_id),
      products.map(({ stock }) => stock),
    );
  }

  static async validateProducts(products: number[]) {
    // make sure all p_ids are in DB
    return await GeneralModel.getArray("products", "p_id", products, {
      limit: null,
    });
  }

  static async #queryProducts(o_id: number) {
    return await GeneralModel.get("o_p", {
      conditions: { o_id },
      limit: null,
    });
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
