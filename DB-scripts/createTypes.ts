import tableSchema from "../../config/tableSchema.ts";
import db from "../../config/pool.ts";

async function createTypes() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const initQuery of Object.values(tableSchema.TYPES)) {
      await client.query(initQuery);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
  } finally {
    client.release();
  }
}

await createTypes();
