import { L_Types, T_IN, T_OUT } from "../config/tableTypes.ts";
import GeneralModel from "./generalModel.ts";

const TableName = "LOCATIONS" as const;
type Input = T_IN[typeof TableName];
type Output = T_OUT[typeof TableName];

export default class Location {
  l_id: number;
  l_name: string;
  pa_id: number | null;
  l_role: L_Types;

  static table = TableName;

  constructor(data: Output) {
    this.l_id = data.l_id;
    this.l_name = data.l_name;
    this.pa_id = data.pa_id;
    this.l_role = data.l_role;
  }

  static async create(data: Input) {
    const output = await GeneralModel.create(this.table, data);
    return new Location(output);
  }

  static async get(data: Partial<Output>) {
    const output = await GeneralModel.get(this.table, data);
    return output.map((location) => new Location(location));
  }

  static async getAll() {
    const output = await GeneralModel.get(this.table);
    return output.map((location) => new Location(location));
  }

  static async update(data: Partial<Output>, conditions?: Partial<Output>) {
    const output = await GeneralModel.update(this.table, data, conditions);
    return output.map((location) => new Location(location));
  }
}
