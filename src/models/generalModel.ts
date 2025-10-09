import { TNAMES } from "../config/tableSchema.ts";
import { T_IN, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { PoolClient } from "pg";

type TableNames = keyof typeof TNAMES;
interface SelectOptions<K, C = K> {
  limit?: number | null;
  order?: Extract<keyof K, string>[];
  desc?: boolean;
  conditions?: Partial<C>;
}

export default (function () {
  async function create<TName extends TableNames>(
    table: TName,
    data?: T_IN[TName],
    client?: PoolClient,
  ) {
    const connection = client ?? db;
    const queryValues = data
      ? `${getColumnNames(data)} VALUES ${getPlaceholders(Object.keys(data).length)}`
      : "";
    const query = `INSERT INTO ${TNAMES[table]} ${queryValues} RETURNING *;`;
    const values = getValues(data);

    const output = await connection.query<T_OUT[TName]>(query, values);
    return parseOutput(output.rows)[0];
  }

  async function get<TName extends TableNames>(
    table: TName,
    {
      order,
      limit = 1,
      desc = false,
      conditions,
    }: SelectOptions<T_OUT[TName]> = {},
  ) {
    let query = `SELECT * FROM ${TNAMES[table]}`;
    query += getConditionals(1, conditions);
    query += getOrder(order, desc);
    query += getLimit(limit);
    query += ";";

    const output = await db.query<T_OUT[TName]>(query, getValues(conditions));
    return output.rows;
  }

  async function getJoin<
    T1 extends T_OUT[TableNames],
    T2 extends T_OUT[TableNames] = T1,
  >(
    join: string,
    tableName: string,
    { order, limit = 1, desc = false, conditions }: SelectOptions<T1 & T2> = {},
  ) {
    const tablePrefix = tableName ? tableName + "." : "";
    let query = `SELECT * FROM ${join}`;
    query += getConditionals(1, conditions, tablePrefix);
    query += getOrder(order, desc, tablePrefix);
    query += getLimit(limit);
    query += ";";

    const output = await db.query<T1 & T2>(query, getValues(conditions));
    return output.rows;
  }

  async function getArray<
    TName extends TableNames,
    CName extends Extract<keyof T_OUT[TName], string>,
  >(
    table: TName,
    column: CName,
    values: T_OUT[TName][CName][],
    { order, limit = 1, desc = false, conditions }: SelectOptions<T_OUT[TName]>,
  ) {
    const CQuery = conditions
      ? getConditionals(1, conditions) +
        ` AND ${column} = ANY($${String(Object.keys(conditions).length + 1)})`
      : ` WHERE ${column} = ANY($1)`;
    const CValues = conditions ? Object.values(conditions) : [];
    const output = await db.query<T_OUT[TName]>(
      `SELECT * from ${table}${CQuery}${getOrder(order, desc)}${getLimit(limit)};`,
      [...CValues, values],
    );
    return output.rows;
  }

  async function update<TName extends TableNames>(
    table: TName,
    data: Partial<T_OUT[TName]>,
    conditions?: Partial<T_OUT[TName]>,
  ) {
    const dataPlaceholder = Object.keys(data).length;
    const output = await db.query<T_OUT[TName]>(
      `UPDATE ${TNAMES[table]} SET ${getColumnNames(data)} = ${getPlaceholders(dataPlaceholder)}
      ${getConditionals(dataPlaceholder + 1, conditions)} RETURNING *;`,
      Object.values(data).concat(getValues(conditions)),
    );
    return parseOutput(output.rows);
  }

  async function remove<TName extends TableNames>(
    table: TName,
    conditions: Partial<T_OUT[TName]>,
  ) {
    const query = `DELETE FROM ${TNAMES[table]}
    ${getConditionals(1, conditions)};`;
    await db.query(query, getValues(conditions));
  }

  async function timestamp<
    TName extends TableNames,
    TCol extends keyof T_OUT[TName],
  >(
    table: TName,
    column: TCol,
    conditions: Partial<T_OUT[TName]>,
    value: boolean,
  ) {
    const output = await db.query<Pick<T_OUT[TName], TCol>>(
      `UPDATE ${TNAMES[table]} SET ${String(column)} = ${value ? "NOW()" : "NULL"}
      ${getConditionals(1, conditions)} RETURNING ${String(column)};`,
      getValues(conditions),
    );
    return parseOutput(output.rows)[0][column];
  }

  function getColumnNames(data: Partial<T_OUT[TableNames] | T_IN[TableNames]>) {
    return `(${Object.keys(data).join(", ")})`;
  }

  function getPlaceholders(length: number) {
    return `(${Array.from({ length }, (_v, idx) => `$${String(idx + 1)}`).join(", ")})`;
  }

  function getConditionals(
    placeholder: number,
    conditions?: Partial<T_OUT[TableNames]>,
    tablePrefix?: string,
  ) {
    if (!conditions) return "";
    const conditionString = Object.keys(conditions)
      .map(
        (column) => `${tablePrefix ?? ""}${column} = $${String(placeholder++)}`,
      )
      .join(" AND ");
    return ` WHERE ${conditionString}`;
  }

  function parseOutput<T>(data: T[], errorMsg: string = "Database Error") {
    if (data.length === 0 || !data[0]) throw new Error(errorMsg);
    return data as [T, ...T[]];
  }

  function getValues(data: object | undefined) {
    return data ? Object.values(data) : undefined;
  }

  function getOrder(
    order: string[] | undefined,
    desc: boolean,
    tablePrefix?: string,
  ) {
    if (!order) return "";
    if (tablePrefix) order = order.map((column) => tablePrefix + column);
    return ` ORDER BY ${order.join(", ")}${desc ? "DESC" : ""}`;
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
