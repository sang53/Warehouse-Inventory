import pool from "./pool.ts";

async function getAllUsernames() {
  const { rows } = await pool.query<{ username: string }>(
    "SELECT * FROM usernames",
  );
  return rows;
}

async function insertUsername(username: string) {
  await pool.query<{ username: string }, string[]>(
    "INSERT INTO usernames (username) VALUES ($1)",
    [username],
  );
}

export default { getAllUsernames, insertUsername };
