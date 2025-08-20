import db from "../../config/pool.ts";

import { L_Types, T_IN, U_Types } from "../../config/tableTypes.ts";
import Location from "../../models/locationsModel.ts";
import createUser from "../../services/createUser.ts";
import capitalise from "../capitalise.ts";

const HEIGHT = 9;
const WIDTH = 9;
const LOCATIONS_DATA = Array.from({ length: HEIGHT * WIDTH }, (_v, k) => {
  const row = Math.floor(k / WIDTH) + 1;
  const col = String.fromCharCode("A".charCodeAt(0) + (k % WIDTH));
  const l_role = Object.values(L_Types)[Math.floor(row / 3)] ?? L_Types.STORAGE;
  return { l_name: `${String(row)}-${col}`, l_role } as T_IN["LOCATIONS"];
});
const USERS: T_IN["USERS"][] = [
  {
    username: U_Types.ADMIN,
    password: U_Types.ADMIN,
    u_name: capitalise(U_Types.ADMIN),
    u_role: U_Types.ADMIN,
  },
  {
    username: U_Types.INTAKE,
    password: capitalise(U_Types.INTAKE),
    u_name: U_Types.INTAKE,
    u_role: U_Types.INTAKE,
  },
  {
    username: U_Types.PICKER,
    password: U_Types.PICKER,
    u_name: capitalise(U_Types.PICKER),
    u_role: U_Types.PICKER,
  },
  {
    username: U_Types.OUTGOING,
    password: U_Types.OUTGOING,
    u_name: capitalise(U_Types.OUTGOING),
    u_role: U_Types.OUTGOING,
  },
];

async function createDefaultLocations() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await Promise.all(
      LOCATIONS_DATA.map((locationData) =>
        Location.create(locationData, client),
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
    await Promise.all(USERS.map((userData) => createUser(userData)));
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
