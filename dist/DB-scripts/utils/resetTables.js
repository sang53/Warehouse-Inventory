import db from "../../config/pool.js";
import tableSchema from "../../config/tableSchema.js";
const TNAMES = Object.keys(tableSchema.TABLES);
export async function resetTables() {
    const client = await db.connect();
    try {
        await client.query("BEGIN");
        await client.query(`TRUNCATE ${Object.values(TNAMES).join(", ")} CASCADE;`);
        await client.query("COMMIT");
    }
    catch (err) {
        console.error(err);
        await client.query("ROLLBACK");
    }
    finally {
        client.release();
    }
}
