import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

async function dropTypes() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DROP TYPE ${Object.keys(tableSchema.TYPES).join(", ")} CASCADE;`,
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error dropping tables: ", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

await dropTypes();
