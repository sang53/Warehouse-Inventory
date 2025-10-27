import initLocations from "./utils/initLocations.ts";
import initUsers from "./utils/initUsers.ts";
import insertProducts from "./utils/insertProducts.ts";
import insertStorage from "./utils/insertStorage.ts";
import db from "../config/pool.ts";
import initOrdersTasks from "./utils/initOrdersTasks.ts";

export async function initData() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const [NUM_PRODUCTS, users] = await Promise.all([
      insertProducts(client),
      initUsers(client),
      initLocations(client),
    ]);
    await insertStorage(client, NUM_PRODUCTS);
    await initOrdersTasks(client, NUM_PRODUCTS, users);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
  } finally {
    client.release();
  }
}

if (import.meta.url === `file://${process.argv[1] as string}`) {
  await initData();
}
