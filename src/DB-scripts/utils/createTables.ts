import tableSchema from "../../config/tableSchema.ts";
import db from "../../config/pool.ts";

export async function createTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const initQuery of Object.values(tableSchema.TABLES)) {
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
