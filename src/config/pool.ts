import { Pool, types } from "pg";
import "dotenv/config";

types.setTypeParser(23, (val) => Number(val));

export default new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
});
