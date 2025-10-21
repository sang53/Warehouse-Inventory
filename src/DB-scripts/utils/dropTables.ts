import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

const TNAMES = Object.keys(tableSchema.TABLES);

export async function dropTables() {
  await Promise.allSettled(
    TNAMES.map((table) => db.query(`DROP TABLE ${table} CASCADE;`)),
  );
}
