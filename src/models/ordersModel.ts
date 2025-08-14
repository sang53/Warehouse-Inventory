import { T_IN, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { TNAMES } from "../config/tableSchema.ts";
import parseOutput from "../utils/parseOutput.ts";
import type { PoolClient } from "pg";

export default class Order {
  p_id: number;
  stock: number;
  o_id: number;
  complete: string | null;
  t_id: number | null;

  constructor(orderData: T_OUT["ORDERS"]) {
    this.o_id = orderData.o_id;
    this.p_id = orderData.p_id;
    this.stock = orderData.stock;
    this.complete = orderData.complete;
    this.t_id = orderData.t_id;
  }

  static async get(id: number) {
    const data = await db.query<T_OUT["ORDERS"]>(
      `SELECT * FROM ${TNAMES.ORDERS} WHERE o_id = $1;`,
      [id],
    );
    if (!data.rows.length || !data.rows[0])
      throw new Error(`Order ID ${String(id)} Not Found`);
    return new Order(data.rows[0]);
  }

  static async getAll() {
    const data = await db.query<T_OUT["ORDERS"]>(
      `SELECT * FROM ${TNAMES.ORDERS};`,
    );
    return data.rows.map((order) => new Order(order));
  }

  static async create(order: T_IN["ORDERS"], client?: PoolClient) {
    const connection = client || db;
    const data = await connection.query<T_OUT["ORDERS"]>(
      `INSERT INTO ${TNAMES.ORDERS} (p_id, stock) VALUES ($1, $2) RETURNING *;`,
      [order.p_id, order.stock],
    );
    const parsedOutput = parseOutput(data.rows, `Order Cannot Be Created`);
    return new Order(parsedOutput[0]);
  }
}
