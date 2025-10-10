import db from "../../config/pool.ts";
import * as argon2 from "argon2";
import { LOCATION_TYPES, T_IN, USER_TYPES } from "../../config/tableTypes.ts";
import capitalise from "../capitalise.ts";
import GeneralModel from "../../models/generalModel.ts";

const HEIGHT = 9;
const WIDTH = 9;
const LOCATIONS_DATA = Array.from({ length: HEIGHT * WIDTH }, (_v, k) => {
  const row = Math.floor(k / WIDTH) + 1;
  const col = String.fromCharCode("A".charCodeAt(0) + (k % WIDTH));
  const l_role =
    Object.values(LOCATION_TYPES)[Math.floor(row / 3)] ?? LOCATION_TYPES[2];
  return { l_name: `${String(row)}-${col}`, l_role } as T_IN["LOCATIONS"];
});
const USERS: T_IN["USERS"][] = [
  {
    username: USER_TYPES[0],
    password: USER_TYPES[0],
    u_name: capitalise(USER_TYPES[0]),
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

async function createDefaultLocations() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await Promise.all(
      LOCATIONS_DATA.map((locationData) =>
        GeneralModel.create("LOCATIONS", locationData, client),
      ),
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error inserting default locations:", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function createDefaultUsers() {
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
        GeneralModel.create("USERS", userData, client),
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

await createDefaultLocations();
await createDefaultUsers();
