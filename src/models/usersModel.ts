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
    const users = output.map((user) => new User(user));
    return GeneralModel.parseOutput(users, "User Not Found");
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
    const output = await GeneralModel.get("users", {
      conditions: { username },
      limit: 1,
    });
    const [user] = GeneralModel.parseOutput(output, "User Not Found");
    return new VerifyUser(user);
  }
}

export class VerifyUser extends User {
  username: string;
  password: string;

  constructor(data: OutUser) {
    super(data);
    this.username = data.username;
    this.password = data.password;
  }

  static async create(data: InUser) {
    data.password = await argon2.hash(data.password);
    const output = await GeneralModel.create("users", data);
    return new User(output);
  }
}
