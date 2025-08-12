import { Pool } from "pg";
import "dotenv/config";

export default new Pool({
  host: "localhost",
  user: process.env.DB_USER,
  database: "top_users",
  password: process.env.DATABASE_PASSWORD,
});
