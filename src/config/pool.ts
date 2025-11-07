import { Pool, types } from "pg";
import "dotenv/config";

types.setTypeParser(23, (val) => Number(val));

export default new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DATABASE_PASSWORD,
});
