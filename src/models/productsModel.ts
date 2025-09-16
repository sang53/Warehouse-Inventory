import { T_IN, T_OUT } from "../config/tableTypes.ts";
import GeneralModel from "./generalModel.ts";

const TableName = "PRODUCTS" as const;
type Input = T_IN[typeof TableName];
type Output = T_OUT[typeof TableName];
export default class Product {
  p_name: string;
  p_id: number;

  static table = TableName;

  constructor(data: Output) {
    this.p_name = data.p_name;
    this.p_id = data.p_id;
  }

  static async create(data: Input) {
    const output = await GeneralModel.create(this.table, data);
    return new Product(output);
  }

  static async get(data: Partial<Output>) {
    const output = await GeneralModel.get(this.table, data);
    return GeneralModel.parseOutput(
      output.map((product) => new Product(product)),
    );
  }

  static async getAll() {
    const output = await GeneralModel.get(this.table);
    return output.map((product) => new Product(product));
  }

  static async update(data: Partial<Output>, conditions?: Partial<Output>) {
    const output = await GeneralModel.update(this.table, data, conditions);
    return output.map((product) => new Product(product));
  }
}
