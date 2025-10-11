import { TNAMES } from "../config/tableSchema.ts";
import { OrderType, T_IN, T_OUT } from "../config/tableTypes.ts";
import generalModel from "./generalModel.ts";
import GeneralModel from "./generalModel.ts";
import Product from "./productsModel.ts";
import db from "../config/pool.ts";

const TableName = "ORDERS" as const;
const TasksTable = "O_T" as const;
const ProductsTable = "O_P" as const;

type Output = T_OUT[typeof TableName] & T_OUT[typeof TasksTable];

export default class Order {
  o_id: number;
  completed: string | null;
  o_type: OrderType;
  placed: string;
  t_id: number;

  static table = TableName;
  static TasksTable = TasksTable;

  static Query = `${TNAMES[Order.table]} AS a
    LEFT JOIN ${TNAMES[Order.TasksTable]} AS b
    ON a.o_id = b.o_id`;

  constructor(data: Output) {
    this.o_id = data.o_id;
    this.completed = data.completed;
    this.o_type = data.o_type;
    this.placed = data.placed;
    this.t_id = data.t_id;
  }

  static async get(data: Partial<Output>, limit?: number | null) {
    const output = await GeneralModel.getJoin<Output>(Order.Query, "a", {
      conditions: data,
      limit,
    });
    const orders = output.map((order) => new Order(order));
    return GeneralModel.parseOutput(orders, `Order Not Found`);
  }

  static async getAll() {
    const output = await GeneralModel.getJoin<Output>(Order.Query, "a", {
      limit: 50,
      desc: true,
      order: ["placed"],
    });
    return output.map((order) => new Order(order));
  }

  static async getByTask(t_id: number) {
    const query = `SELECT b.* FROM ${TNAMES["O_T"]} a
    JOIN ${TNAMES["ORDERS"]} b
    ON a.o_id = b.o_id;`;
    const output = await generalModel.getJoin<T_OUT["O_T"], T_OUT["ORDERS"]>(
      query,
      "a",
      { conditions: { t_id } },
    );
    const [order] = GeneralModel.parseOutput(
      output,
      `Task ${String(t_id)} not associated with Order`,
    );

    return new Order(order);
  }

  static async getByComplete(complete: boolean, o_type?: OrderType) {
    const query = `SELECT * FROM ${TNAMES["O_T"]} a
    JOIN ${TNAMES["ORDERS"]} b
    ON a.o_id = b.o_id
    WHERE b.completed IS ${complete ? "NOT" : ""} NULL
    ${o_type ? "AND b.o_type = $1" : ""}
    ORDER BY b.placed
    LIMIT 20;`;

    const output = await db.query<Output>(query, o_type ? [o_type] : []);
    return output.rows.map((order) => new Order(order));
  }

  async addTask(t_id: number) {
    const output = await GeneralModel.create(Order.TasksTable, {
      o_id: this.o_id,
      t_id,
    });
    this.t_id = output.t_id;
    return this;
  }

  async complete() {
    this.completed = await generalModel.timestamp(
      "ORDERS",
      "completed",
      { o_id: this.o_id },
      true,
    );
    return this;
  }
}

export class ProductOrder extends Order {
  static ProductsTable = ProductsTable;
  products: Map<number, number>;

  constructor(data: Output, products: number[], stock: number[]) {
    super(data);
    this.products = this.#getProductMap(products, stock);
  }

  static async getProducts(order: Order) {
    const products = await this.#queryProducts(order.o_id);

    return new ProductOrder(
      order,
      products.map(({ p_id }) => p_id),
      products.map(({ stock }) => stock),
    );
  }

  static async create(
    { o_type }: T_IN[typeof Order.table],
    t_id: number,
    products: number[],
    stock: number[],
  ) {
    await this.#validateProducts(products);
    const output = await GeneralModel.create(Order.table, { o_type });
    const order = new ProductOrder({ ...output, t_id }, products, stock);
    await Promise.allSettled([
      ...products.map((p_id, idx) => {
        if (stock[idx])
          return GeneralModel.create(ProductOrder.ProductsTable, {
            o_id: order.o_id,
            p_id,
            stock: stock[idx],
          });
        else return null;
      }),
      order.addTask(t_id),
    ]);
    return order;
  }

  static async getFull(data: Partial<Output>) {
    const [order] = await this.get(data);
    const products = await this.#queryProducts(order.o_id);

    return new ProductOrder(
      order,
      products.map(({ p_id }) => p_id),
      products.map(({ stock }) => stock),
    );
  }

  static async #validateProducts(products: number[]) {
    // make sure all p_ids are in DB
    const DBproducts = await generalModel.getArray(
      Product.table,
      "p_id",
      products,
      {
        limit: null,
      },
    );
    const ValidProducts = new Set(DBproducts.map((product) => product.p_id));
    const invalidProducts = products.filter((p_id) => !ValidProducts.has(p_id));
    if (invalidProducts.length)
      throw new Error(`Invalid Product ID/s: ${String(invalidProducts)}`);
  }

  static async #queryProducts(o_id: number) {
    return await generalModel.get(ProductOrder.ProductsTable, {
      conditions: { o_id },
    });
  }

  #getProductMap(products: number[], stock: number[]) {
    return new Map(
      products.map((p_id, idx) => {
        if (stock[idx]) return [p_id, stock[idx]];
        else return [NaN, NaN];
      }),
    );
  }
}
