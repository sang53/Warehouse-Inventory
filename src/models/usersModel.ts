import type { PoolClient } from "pg";
import db from "../config/pool.ts";
import { TNAMES } from "../config/tableSchema.ts";
import { T_IN, T_OUT, U_Types } from "../config/tableTypes.ts";
import parseOutput from "../utils/parseOutput.ts";

export default class User {
  u_id: number;
  u_name: string;
  u_role: U_Types;

  constructor(data: T_OUT["USERS"]) {
    this.u_id = data.u_id;
    this.u_role = data.u_role;
    this.u_name = data.u_name;
  }

  static async get(id: number) {
    const data = await db.query<T_OUT["USERS"]>(
      "SELECT (u_id, u_name, u_role) FROM users WHERE u_id = $1;",
      [id],
    );
    if (!data.rows.length || !data.rows[0])
      throw new Error(`User ID ${String(id)} NOT FOUND`);
    return new User(data.rows[0]);
  }

  static async create(userData: T_IN["USERS"], client?: PoolClient) {
    const connection = client || db;
    const userOutput = await connection.query<T_OUT["USERS"]>(
      "INSERT INTO users (username, password, u_name, u_role) VALUES ($1, $2, $3, $4) RETURNING *;",
      [userData.username, userData.password, userData.u_name, userData.u_role],
    );
    return new User(parseOutput(userOutput.rows, `User Cannot Be Created`)[0]);
  }

  static async getAll() {
    const data = await db.query<T_OUT["USERS"]>(
      `SELECT (u_id, u_name, u_role) FROM ${TNAMES.USERS};`,
    );
    return data.rows.map((user) => new User(user));
  }
}

export class VerifyUser {
  u_id: number;
  username: string;
  password: string;

  constructor(userData: T_OUT["USERS"]) {
    this.u_id = userData.u_id;
    this.username = userData.username;
    this.password = userData.password;
  }

  static async getByUsername(username: string) {
    const data = await db.query<T_OUT["USERS"]>(
      `SELECT (u_id, username, password) FROM ${TNAMES.USERS} WHERE username = $1;`,
      [username],
    );
    return new VerifyUser(parseOutput(data.rows)[0]);
  }
}
