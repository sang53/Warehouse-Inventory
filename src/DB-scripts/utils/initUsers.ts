import db from "../../config/pool.ts";
import * as argon2 from "argon2";
import GeneralModel from "../../models/generalModel.ts";

const USER_TYPES = ["admin", "intake", "picker", "outgoing"] as const;
const USERS = [
  {
    username: USER_TYPES[0],
    password: capitalise(USER_TYPES[0]),
    u_name: USER_TYPES[0],
    u_role: USER_TYPES[0],
  },
  {
    username: USER_TYPES[1],
    password: capitalise(USER_TYPES[1]),
    u_name: USER_TYPES[1],
    u_role: USER_TYPES[1],
  },
  {
    username: USER_TYPES[2],
    password: capitalise(USER_TYPES[2]),
    u_name: USER_TYPES[2],
    u_role: USER_TYPES[2],
  },
  {
    username: USER_TYPES[3],
    password: capitalise(USER_TYPES[3]),
    u_name: USER_TYPES[3],
    u_role: USER_TYPES[3],
  },
];

export default async function () {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const hashedUsers = await Promise.all(
      USERS.map(async (userData) => {
        return { ...userData, password: await argon2.hash(userData.password) };
      }),
    );
    await Promise.all(
      hashedUsers.map((userData) =>
        GeneralModel.create("users", userData, client),
      ),
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error inserting default users", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

function capitalise(str: string) {
  return str.charAt(0) + str.slice(1);
}
