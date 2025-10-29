import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";
import { PoolClient } from "pg";

export interface InLocation {
  l_name: string;
  l_role: LocationType;
}

export interface OutLocation extends InLocation {
  l_id: number;
  pa_id: number | null;
}

interface LocationData {
  l_name: string;
  p_id: number;
  stock: number;
  pa_id: number;
}

type LocationType = "intake" | "storage" | "outgoing";

export default class Location {
  l_id: number;
  l_name: string;
  pa_id: number | null;
  l_role: LocationType;

  constructor(data: OutLocation) {
    this.l_id = data.l_id;
    this.l_name = data.l_name;
    this.pa_id = data.pa_id;
    this.l_role = data.l_role;
  }

  static async create(data: InLocation, client?: PoolClient) {
    const output = await GeneralModel.create("locations", data, client);
    return new Location(output);
  }

  static async get(
    data: Partial<OutLocation>,
    limit?: number | null,
    client?: PoolClient,
  ) {
    const output = await GeneralModel.get(
      "locations",
      {
        conditions: data,
        limit,
      },
      client,
    );
    const locations = output.map((location) => new Location(location));
    return GeneralModel.parseOutput(locations, `Location Not Found`);
  }

  static async getAll() {
    const output = await GeneralModel.get("locations", { limit: null });
    return output.map((location) => new Location(location));
  }

  static async #update(
    data: Partial<OutLocation>,
    conditions: Partial<OutLocation>,
    client?: PoolClient,
  ) {
    const output = await GeneralModel.update(
      "locations",
      data,
      conditions,
      client,
    );
    return output.map((location) => new Location(location));
  }

  static async getEmpty(l_role: LocationType, client?: PoolClient) {
    // query to find empty locations
    // selects locations of l_role with no current pallet
    // excludes locations that have a uncompleted task associated with the location
    const query = `SELECT a.l_id FROM locations a 
      WHERE a.l_role = $1
      AND a.pa_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM tasks b
        JOIN taskRels c
        ON b.t_id = c.t_id
        WHERE a.l_id = c.l_id 
        AND b.completed IS NULL
      )
      LIMIT 1;`;

    const connection = client ?? db;

    const output = await connection.query<{ l_id: number }>(query, [l_role]);
    const [location] = GeneralModel.parseOutput(
      output.rows,
      `No empty locations of ${l_role} - report to admin`,
    );
    return location.l_id;
  }

  static async movePallet(
    pa_id: number,
    l_id: number | null,
    client?: PoolClient,
  ) {
    await Location.#update({ pa_id: null }, { pa_id }, client);
    if (l_id) await Location.#update({ pa_id }, { l_id }, client);
  }

  static async getByProducts(
    products: Map<number, number>,
    client?: PoolClient,
  ) {
    const connection = client ?? db;
    const query = `
    SELECT b.p_id, b.stock, a.pa_id, a.l_name
    FROM p_pa b
    JOIN locations a ON a.pa_id = b.pa_id
    WHERE a.l_role = 'storage' AND b.p_id = ANY($1)
    ORDER BY a.l_name;`;

    const { rows } = await connection.query<LocationData>(query, [
      Array.from(products.keys()),
    ]);
    return rows;
  }
}
