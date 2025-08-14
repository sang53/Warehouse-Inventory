import { T_IN, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { TNAMES } from "../config/tableSchema.ts";
import parseOutput from "../utils/parseOutput.ts";
import type { PoolClient } from "pg";

export default class Product {
  p_name: string;
  p_id: number;
  constructor(productData: T_OUT["PRODUCTS"]) {
    this.p_name = productData.p_name;
    this.p_id = productData.p_id;
  }

  static async get(id: number) {
    const data = await db.query<T_OUT["PRODUCTS"]>(
      `SELECT * FROM ${TNAMES.PRODUCTS} WHERE p_id = $1;`,
      [id],
    );
    return new Product(
      parseOutput(data.rows, `Product ID ${String(id)} Not Found`)[0],
    );
  }

  static async getAll() {
    const data = await db.query<T_OUT["PRODUCTS"]>(
      `SELECT * FROM ${TNAMES.PRODUCTS};`,
    );
    return data.rows.map((productData) => new Product(productData));
  }

  static async create(productData: T_IN["PRODUCTS"], client?: PoolClient) {
    const connection = client || db;
    const data = await connection.query<T_OUT["PRODUCTS"]>(
      `INSERT INTO ${TNAMES.PRODUCTS} (p_name) VALUES ($1) RETURNING *;`,
      [productData.p_name],
    );
    return new Product(
      parseOutput(
        data.rows,
        `Product ${productData.p_name} Cannot Be Created`,
      )[0],
    );
  }
}
