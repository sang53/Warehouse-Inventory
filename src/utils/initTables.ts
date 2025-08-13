import db from "../config/pool.ts";
import initQueries from "../config/tableSchema.ts";
import { TNAMES } from "../config/tableSchema.ts";

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

async function createTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const initQuery of initQueries) {
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

await dropTables();
await createTables();
