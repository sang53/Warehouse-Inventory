import { TNAMES } from "../config/tableSchema.ts";
import { LocationType, T_IN, T_OUT } from "../config/tableTypes.ts";
import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";

const TableName = "LOCATIONS" as const;
type Input = T_IN[typeof TableName];
type Output = T_OUT[typeof TableName];

export interface LocationData {
  l_name: LocationType;
  p_id: number;
  stock: number;
  pa_id: number;
}

export default class Location {
  l_id: number;
  l_name: string;
  pa_id: number | null;
  l_role: LocationType;

  static table = TableName;

  constructor(data: Output) {
    this.l_id = data.l_id;
    this.l_name = data.l_name;
    this.pa_id = data.pa_id;
    this.l_role = data.l_role;
  }

  static async create(data: Input) {
    const output = await GeneralModel.create(this.table, data);
    return new Location(output);
  }

  static async get(data: Partial<Output>, limit?: number | null) {
    const output = await GeneralModel.get(this.table, {
      conditions: data,
      limit,
    });
    const locations = output.map((location) => new Location(location));
    return GeneralModel.parseOutput(locations, `Location Not Found`);
  }

  static async getAll() {
    const output = await GeneralModel.get(this.table, { limit: null });
    return output.map((location) => new Location(location));
  }

  static async #update(data: Partial<Output>, conditions?: Partial<Output>) {
    const output = await GeneralModel.update(this.table, data, conditions);
    return output.map((location) => new Location(location));
  }

  static async getEmpty(l_role: LocationType) {
    // query to find empty locations
    // selects locations of l_role with no current pallet
    // excludes locations that have a uncompleted task associated with the location
    const query = `SELECT a.l_id FROM ${TNAMES[TableName]} a 
      WHERE a.l_role = $1
      AND a.pa_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM ${TNAMES["TASKS"]} b
        JOIN ${TNAMES["TASKREL"]} c
        ON b.t_id = c.t_id
        WHERE a.l_id = c.l_id 
        AND b.completed IS NULL
      )
      LIMIT 1;`;

    const output = await db.query<{ l_id: number }>(query, [l_role]);
    const location = GeneralModel.parseOutput(
      output.rows,
      `No empty locations of ${l_role} - report to admin`,
    );
    return location[0].l_id;
  }

  static async movePallet(pa_id: number, l_id?: number | null) {
    await Location.#update({ pa_id: null }, { pa_id });
    if (l_id) await Location.#update({ pa_id }, { l_id });
  }

  static async getByProducts(products: Map<number, number>) {
    const query = `
    SELECT b.p_id, b.stock, a.pa_id, a.l_name
    FROM p_pa b
    JOIN locations a ON a.pa_id = b.pa_id
    WHERE a.l_role = 'storage' AND b.p_id = ANY($1)
    ORDER BY a.l_name;`;

    const output = await db.query<LocationData>(query, [
      Array.from(products.keys()),
    ]);

    const data: LocationData[] = [];
    // keep track of how much stock required for each product
    const remainder = new Map(products);

    // get locations names & amount of stock to take for each product
    output.rows.forEach(({ l_name, p_id, stock, pa_id }) => {
      if (!remainder.get(p_id)) return;
      const required = remainder.get(p_id) ?? 0;
      if (required > stock) {
        // location does not have enough stock
        data.push({ l_name, p_id, stock, pa_id });
        remainder.set(p_id, required - stock);
      } else {
        // location has enough stock
        data.push({ l_name, p_id, stock: required, pa_id });
        remainder.delete(p_id);
      }
    });

    // get products with not enough stock
    const missing = Array.from(remainder.entries());
    return { data, missing };
  }
}
