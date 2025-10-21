import db from "../../config/pool.ts";
import tableSchema from "../../config/tableSchema.ts";

export async function dropTypes() {
  await Promise.allSettled(
    Object.keys(tableSchema.TYPES).map((type) =>
      db.query(`DROP TYPE ${type} CASCADE;`),
    ),
  );
}
