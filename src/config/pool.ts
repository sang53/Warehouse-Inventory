import { Pool, types } from "pg";
import "dotenv/config";

types.setTypeParser(23, (val) => Number(val));

export default new Pool({
  host: "localhost",
  user: process.env.DB_USER,
  database: "top_users",
  password: process.env.DATABASE_PASSWORD,
});
