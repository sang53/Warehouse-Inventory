import { T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { TNAMES } from "../config/tableSchema.ts";
import parseOutput from "../utils/parseOutput.ts";
import type { PoolClient } from "pg";

export default class Pallet {
  pa_id: number;
  products?: Map<number, number>;

  constructor(pa_id: number, palletData?: T_OUT["PA_P_PA"][]) {
    this.pa_id = pa_id;
    this.products = palletData
      ? new Map(palletData.map(({ p_id, stock }) => [p_id, stock]))
      : undefined;
  }

  async setStock(p_id: number, stock: number, client?: PoolClient) {
    if (!this.products || !this.products.has(p_id))
      throw new Error(
        `Product ${String(p_id)} Not On Pallet ${String(this.pa_id)}`,
      );
    const connection = client || db;
    await connection.query(
      `UPDATE ${TNAMES.P_PA}
      SET stock = $1
      WHERE pa_id = $2
        AND p_id = $3;`,
      [stock, this.pa_id, p_id],
    );
    this.products.set(p_id, stock);
  }

  static async get(id: number) {
    const data = await db.query<T_OUT["PA_P_PA"]>(
      `SELECT * FROM ${TNAMES.PALLETS} 
      JOIN ${TNAMES.P_PA}
      ON ${TNAMES.PALLETS}.pa_id = ${TNAMES.P_PA}.pa_id
      WHERE pa_id = $1;`,
      [id],
    );
    const palletData = parseOutput(data.rows, `Pallet ${String(id)} Not Found`);
    return new Pallet(palletData[0].pa_id, palletData);
  }

  static async getAll() {
    const data = await db.query<T_OUT["PALLETS"]>(
      `SELECT * FROM ${TNAMES.PALLETS};`,
    );
    return data.rows.map(({ pa_id }) => new Pallet(pa_id));
  }

  static async create(client?: PoolClient) {
    const connection = client || db;
    const data = await connection.query<T_OUT["PALLETS"]>(
      `INSERT INTO ${TNAMES.PALLETS} RETURNING *;`,
    );
    return new Pallet(
      parseOutput(data.rows, `Pallet Creation Failed`)[0].pa_id,
    );
  }
}
