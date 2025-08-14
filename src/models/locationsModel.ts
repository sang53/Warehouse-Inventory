import { L_Types, T_IN, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { TNAMES } from "../config/tableSchema.ts";
import parseOutput from "../utils/parseOutput.ts";
import type { PoolClient } from "pg";

export default class Location {
  l_id: number;
  l_name: string;
  pa_id: number | null;
  l_role: L_Types;
  free: boolean;

  constructor(locationData: T_OUT["LOCATIONS"]) {
    this.l_id = locationData.l_id;
    this.l_name = locationData.l_name;
    this.pa_id = locationData.pa_id;
    this.l_role = locationData.l_role;
    this.free = locationData.free;
  }

  static async create(locationData: T_IN["LOCATIONS"], client?: PoolClient) {
    const connection = client || db;
    const output = await connection.query<T_OUT["LOCATIONS"]>(
      `INSERT INTO locations (l_name, l_role) VALUES ($1, $2) RETURNING *;`,
      [locationData.l_name, locationData.l_role],
    );

    return new Location(parseOutput(output.rows)[0]);
  }

  static async get(id: number) {
    const data = await db.query<T_OUT["LOCATIONS"]>(
      `SELECT * FROM ${TNAMES.LOCATIONS} WHERE l_id = $1;`,
      [id],
    );
    if (!data.rows.length || !data.rows[0])
      throw new Error(`Location ID ${String(id)} Not Found`);
    return new Location(data.rows[0]);
  }

  static async getAll() {
    const data = await db.query<T_OUT["LOCATIONS"]>(
      `SELECT * FROM ${TNAMES.LOCATIONS};`,
    );
    return data.rows.map((location) => new Location(location));
  }
}
