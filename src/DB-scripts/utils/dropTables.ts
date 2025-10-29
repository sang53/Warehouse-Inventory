import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

export async function dropTables() {
  const TNAMES = Object.keys(tableSchema.TABLES);
  for (const table of TNAMES)
    await db.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
}
