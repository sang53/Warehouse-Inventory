import db from "../../config/pool.js";
import tableSchema from "../../config/tableSchema.js";

export async function dropTypes() {
  const TTYPES = Object.keys(tableSchema.TYPES);
  for (const type of TTYPES)
    await db.query(`DROP TYPE IF EXISTS ${type} CASCADE;`);
}
