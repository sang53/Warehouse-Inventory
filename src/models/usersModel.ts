import { T_IN, T_OUT, U_Types } from "../config/tableTypes.ts";
import GeneralModel from "./generalModel.ts";
import * as argon2 from "argon2";

const TableName = "USERS" as const;
type Input = T_IN[typeof TableName];
type Output = T_OUT[typeof TableName];
export default class User {
  u_id: number;
  u_name: string;
  u_role: U_Types;

  static table = TableName;

  constructor(data: Output) {
    this.u_id = data.u_id;
    this.u_role = data.u_role;
    this.u_name = data.u_name;
  }

  static async create(data: Input) {
    data.password = await argon2.hash(data.password);
    const output = await GeneralModel.create(User.table, data);
    return new User(output);
  }

  static async get(data: Partial<Output>) {
    const output = await GeneralModel.get(User.table, data);
    const users = output.map((user) => new User(user));
    if (!users.length) throw new Error(`User not found`);
    return users as [User, ...User[]];
  }

  static async getAll() {
    const output = await GeneralModel.get(User.table);
    return output.map((user) => new User(user));
  }

  static async update(data: Partial<Output>, conditions?: Partial<Output>) {
    const output = await GeneralModel.update(User.table, data, conditions);
    return output.map((user) => new User(user));
  }

  static async getAuthUser(username: string) {
    const output = await GeneralModel.get(User.table, { username });
    const parsedOutput = GeneralModel.parseOutput(output, "User Not Found");
    return new VerifyUser(parsedOutput[0]);
  }
}

class VerifyUser extends User {
  username: string;
  password: string;

  constructor(data: Output) {
    super(data);
    this.username = data.username;
    this.password = data.password;
  }
}
