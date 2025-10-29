import db from "../config/pool.ts";
import { PoolClient } from "pg";
import { InLocation, OutLocation } from "./locationsModel.ts";
import { OrderType, OutOrder } from "./ordersModel.ts";
import { OutPallet, ProductStock } from "./palletsModel.ts";
import { InProduct, OutProduct } from "./productsModel.ts";
import { InUser, OutUser } from "./usersModel.ts";
import { InTask, InTaskRel, OutTask, OutTaskRel } from "./tasksModel.ts";

interface TableInputs {
  products: InProduct;
  pallets: object;
  p_pa: ProductStock & { pa_id: number };
  locations: InLocation;
  orders: { o_type: OrderType };
  o_t: { o_id: number; t_id: number };
  o_p: ProductStock & { o_id: number };
  tasks: InTask;
  taskRels: InTaskRel;
  users: InUser;
}

interface TableOutputs extends TableInputs {
  products: OutProduct;
  pallets: OutPallet;
  locations: OutLocation;
  orders: OutOrder;
  tasks: OutTask;
  taskRels: OutTaskRel;
  users: OutUser;
}

type TableNames = keyof TableOutputs;

interface SelectOptions<K, C = K> {
  limit?: number | null;
  order?: Extract<keyof K, string>[];
  desc?: boolean;
  conditions?: Partial<C>;
}

export default (function () {
  async function create<TName extends TableNames>(
    table: TName,
    data?: TableInputs[TName],
    client?: PoolClient,
  ) {
    const connection = client ?? db;
    const queryValues = data
      ? `${getColumnNames(data)} VALUES ${getPlaceholders(Object.keys(data).length)}`
      : "DEFAULT VALUES";
    const query = `INSERT INTO ${table} ${queryValues} RETURNING *;`;
    const values = getValues(data, false);

    const output = await connection.query<TableOutputs[TName]>(query, values);
    return parseOutput(output.rows)[0];
  }

  async function get<TName extends TableNames>(
    table: TName,
    {
      order,
      limit = 1,
      desc = false,
      conditions,
    }: SelectOptions<TableOutputs[TName]> = {},
    client?: PoolClient,
  ) {
    let query = `SELECT * FROM ${table}`;
    query += getConditionals(1, conditions);
    query += getOrder(order, desc);
    query += getLimit(limit);
    query += ";";

    const connection = client ?? db;

    const output = await connection.query<TableOutputs[TName]>(
      query,
      getValues(conditions),
    );
    return output.rows;
  }

  async function getJoin<T1 extends TableOutputs[TableNames]>(
    join: string,
    tableName: string,
    { order, limit = 1, desc = false, conditions }: SelectOptions<T1> = {},
    client?: PoolClient,
  ) {
    const tablePrefix = tableName ? tableName + "." : "";
    let query = `SELECT * FROM ${join}`;
    query += getConditionals(1, conditions, tablePrefix);
    query += getOrder(order, desc, tablePrefix);
    query += getLimit(limit);
    query += ";";

    const connection = client ?? db;
    const output = await connection.query<T1>(query, getValues(conditions));
    return output.rows;
  }

  async function getArray<
    TName extends TableNames,
    CName extends Extract<keyof TableOutputs[TName], string>,
  >(
    table: TName,
    column: CName,
    values: TableOutputs[TName][CName][],
    {
      order,
      limit = 1,
      desc = false,
      conditions,
    }: SelectOptions<TableOutputs[TName]>,
    client?: PoolClient,
  ) {
    const CValues = getValues(conditions);
    const CQuery = conditions
      ? getConditionals(1, conditions) +
        ` AND ${column} = ANY($${String(CValues.length + 1)})`
      : ` WHERE ${column} = ANY($1)`;

    const connection = client ?? db;
    const output = await connection.query<TableOutputs[TName]>(
      `SELECT * from ${table}${CQuery}${getOrder(order, desc)}${getLimit(limit)};`,
      [...CValues, values],
    );
    return output.rows;
  }

  async function update<TName extends TableNames>(
    table: TName,
    data: Partial<TableOutputs[TName]>,
    conditions?: Partial<TableOutputs[TName]>,
    client?: PoolClient,
  ) {
    const connection = client ?? db;
    const dataPlaceholder = Object.keys(data).length;
    const output = await connection.query<TableOutputs[TName]>(
      `UPDATE ${table} SET ${getColumnNames(data)} = ROW${getPlaceholders(dataPlaceholder)}
      ${getConditionals(dataPlaceholder + 1, conditions)} RETURNING *;`,
      Object.values(data).concat(getValues(conditions)),
    );
    return output.rows;
  }

  async function remove<TName extends TableNames>(
    table: TName,
    conditions: Partial<TableOutputs[TName]>,
    client?: PoolClient,
  ) {
    const connection = client ?? db;
    const query = `DELETE FROM ${table}
    ${getConditionals(1, conditions)};`;
    await connection.query(query, getValues(conditions));
  }

  async function timestamp<
    TName extends TableNames,
    TCol extends keyof TableOutputs[TName],
  >(
    table: TName,
    column: TCol,
    conditions: Partial<TableOutputs[TName]>,
    value: boolean,
    connection?: PoolClient,
  ) {
    const client = connection ?? db;
    const output = await client.query<Pick<TableOutputs[TName], TCol>>(
      `UPDATE ${table} SET ${String(column)} = ${value ? "NOW()" : "NULL"}
      ${getConditionals(1, conditions)} RETURNING ${String(column)};`,
      getValues(conditions),
    );
    return parseOutput(output.rows)[0][column];
  }

  function getColumnNames(data: Partial<TableOutputs[TableNames]>) {
    return `(${Object.keys(data).join(", ")})`;
  }

  function getPlaceholders(length: number) {
    return `(${Array.from({ length }, (_v, idx) => `$${String(idx + 1)}`).join(", ")})`;
  }

  function getConditionals(
    placeholder: number,
    conditions?: Partial<TableOutputs[TableNames]>,
    tablePrefix?: string,
  ) {
    if (!conditions) return "";

    const conditionString = Object.entries(conditions)
      .map(([column, value]) => {
        const prefixColumn = `${tablePrefix ?? ""}${column}`;
        return value === null
          ? `${prefixColumn} IS NULL`
          : `${prefixColumn} = $${String(placeholder++)}`;
      })
      .join(" AND ");

    return ` WHERE ${conditionString}`;
  }

  function parseOutput<T>(data: T[], errorMsg: string = "Database Error") {
    if (data.length === 0 || !data[0]) throw new Error(errorMsg);
    return data as [T, ...T[]];
  }

  function getValues(
    data: object | undefined,
    excludeNull: boolean = true,
  ): unknown[] {
    const values = data ? Object.values(data) : [];
    return excludeNull ? values.filter((value) => value !== null) : values;
  }

  function getOrder(
    order: string[] | undefined,
    desc: boolean,
    tablePrefix?: string,
  ) {
    if (!order) return "";
    if (tablePrefix) order = order.map((column) => tablePrefix + column);
    return ` ORDER BY ${order.join(", ")}${desc ? " DESC" : ""}`;
  }

  function getLimit(limit: number | null) {
    return limit ? ` LIMIT ${String(limit)}` : "";
  }

  return {
    create,
    get,
    update,
    timestamp,
    parseOutput,
    getJoin,
    getArray,
    remove,
  };
})();
