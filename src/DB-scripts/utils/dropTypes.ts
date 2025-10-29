import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

export async function dropTypes() {
  const TTYPES = Object.keys(tableSchema.TYPES);
  for (const type of TTYPES)
    await db.query(`DROP TYPE IF EXISTS ${type} CASCADE;`);
}
