import db from "../../config/pool.ts";
import { TNAMES } from "../../config/tableSchema.ts";

async function dropTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DROP TABLE ${Object.values(TNAMES).join(", ")} CASCADE;`,
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error dropping tables: ", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

await dropTables();
