import db from "../../config/pool.js";
import tableSchema from "../../config/tableSchema.js";
export async function dropTables() {
    const TNAMES = Object.keys(tableSchema.TABLES);
    for (const table of TNAMES)
        await db.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
}
