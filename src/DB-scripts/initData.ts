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

    const [products, users] = await Promise.all([
      insertProducts(client),
      initUsers(client),
      initLocations(client),
    ]);
    const pIds = products.map(({ p_id }) => p_id);
    await insertStorage(client, pIds);
    await initOrdersTasks(client, pIds, users);

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
