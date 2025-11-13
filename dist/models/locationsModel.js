import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
export default class Location {
    l_id;
    l_name;
    pa_id;
    l_role;
    constructor(data) {
        this.l_id = data.l_id;
        this.l_name = data.l_name;
        this.l_role = data.l_role;
        this.pa_id = data.pa_id;
    }
    static async create(data, client) {
        const output = await GeneralModel.create("locations", data, client);
        return new Location(output);
    }
    static async get(data, limit, client) {
        const output = await GeneralModel.get("locations", {
            conditions: data,
            limit,
        }, client);
        const locations = output.map((location) => new Location(location));
        return GeneralModel.parseOutput(locations, `Location Not Found`);
    }
    static async getAll() {
        const output = await GeneralModel.get("locations", {
            limit: null,
            order: ["l_name"],
        });
        return output.map((location) => new Location(location));
    }
    static async #update(data, conditions, client) {
        const output = await GeneralModel.update("locations", data, conditions, client);
        return output.map((location) => new Location(location));
    }
    static async getEmpty(l_role, client) {
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
        const output = await connection.query(query, [l_role]);
        const [location] = GeneralModel.parseOutput(output.rows, `No empty locations of ${l_role} - report to admin`);
        return location.l_id;
    }
    static async movePallet(pa_id, l_id, client) {
        await Location.#update({ pa_id: null }, { pa_id }, client);
        if (l_id)
            await Location.#update({ pa_id }, { l_id }, client);
    }
    static async getByProducts(products, client) {
        const connection = client ?? db;
        const query = `
    SELECT b.p_id, b.stock, a.pa_id, a.l_name
    FROM p_pa b
    JOIN locations a ON a.pa_id = b.pa_id
    WHERE a.l_role = 'storage' AND b.p_id = ANY($1)
    ORDER BY a.l_name;`;
        const { rows } = await connection.query(query, [
            Array.from(products.keys()),
        ]);
        return rows;
    }
}
