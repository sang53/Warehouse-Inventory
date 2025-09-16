import db from "../../config/pool.ts";
import { TNAMES } from "../../config/tableSchema.ts";

async function dropTables() {
  await Promise.allSettled(
    Object.values(TNAMES).map((table) =>
      db.query(`DROP TABLE ${table} CASCADE;`),
    ),
  );
}

await dropTables();
