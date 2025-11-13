import initLocations from "./utils/initLocations.js";
import initUsers from "./utils/initUsers.js";
import insertProducts from "./utils/insertProducts.js";
import insertStorage from "./utils/insertStorage.js";
import db from "../config/pool.js";
import initOrdersTasks from "./utils/initOrdersTasks.js";
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
    }
    catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
    }
    finally {
        client.release();
    }
}
