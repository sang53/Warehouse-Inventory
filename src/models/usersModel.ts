import { PoolClient } from "pg";
import GeneralModel from "./generalModel.ts";
import * as argon2 from "argon2";

export interface InUser {
  username: string;
  password: string;
  u_name: string;
  u_role: UserType;
}

export interface OutUser extends InUser {
  u_id: number;
}

export type UserType = "intake" | "picker" | "outgoing" | "admin";
export default class User {
  u_id: number;
  u_name: string;
  u_role: UserType;

  constructor(data: OutUser) {
    this.u_id = data.u_id;
    this.u_role = data.u_role;
    this.u_name = data.u_name;
  }

  static async get(data: Partial<OutUser>, limit?: number | null) {
    const output = await GeneralModel.get("users", {
      conditions: data,
      limit,
    });
    return output.map((user) => new User(user));
  }

  static async getAll() {
    const output = await GeneralModel.get("users", { limit: 50 });
    return output.map((user) => new User(user));
  }

  static async update(data: Partial<OutUser>, conditions?: Partial<OutUser>) {
    const output = await GeneralModel.update("users", data, conditions);
    return output.map((user) => new User(user));
  }

  static async getAuthUser(username: string) {
    return await GeneralModel.get("users", {
      conditions: { username },
      limit: 1,
    });
  }

  static async create(data: InUser, client?: PoolClient) {
    data.password = await argon2.hash(data.password);
    const output = await GeneralModel.create("users", data, client);
    return new User(output);
  }
}
