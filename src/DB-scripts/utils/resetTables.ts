import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

const TNAMES = Object.keys(tableSchema.TABLES);

export async function resetTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`TRUNCATE ${Object.values(TNAMES).join(", ")} CASCADE;`);
    await client.query("COMMIT");
  } catch (err) {
    console.log(err);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
