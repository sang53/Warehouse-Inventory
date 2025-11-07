import { PoolClient } from "pg";
import db from "../config/pool.js";

// wraps a given functionn in a transaction
export default async function <T, R>(
  callback: (client: PoolClient, args: T) => Promise<R>,
  args: T,
) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client, args);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    throw err;
  } finally {
    client.release();
  }
}
