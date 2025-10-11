import db from "../../config/pool.ts";
import { TNAMES } from "../../config/tableSchema.ts";

async function resetTables() {
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

await resetTables();
