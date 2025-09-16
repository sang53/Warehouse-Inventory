import { TNAMES } from "../config/tableSchema.ts";
import { T_IN, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
import { PoolClient } from "pg";

type TableNames = keyof typeof TNAMES;

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
    const query = `INSERT INTO ${table} ${queryValues} RETURNING *;`;
    const values = data ? Object.values(data) : undefined;

    const output = await connection.query<T_OUT[TName]>(query, values);
    return parseOutput(output.rows)[0];
  }

  async function get<TName extends TableNames>(
    table: TName,
    conditions?: Partial<T_OUT[TName]>,
  ) {
    const output = await db.query<T_OUT[TName]>(
      `SELECT * FROM ${table}${getConditionals(conditions)};`,
    );
    return output.rows;
  }

  async function getJoin<
    T1 extends T_OUT[TableNames],
    T2 extends T_OUT[TableNames],
  >(join: string, conditions?: Partial<T1 & T2>) {
    const output = await db.query<T1 & T2>(
      `SELECT * FROM ${join}${getConditionals(conditions)}${conditions ? " ORDER BY " + Object.keys(conditions).join(", ") : ""};`,
    );
    return output.rows;
  }

  async function update<TName extends TableNames>(
    table: TName,
    data: Partial<T_OUT[TName]>,
    conditions?: Partial<T_OUT[TName]>,
  ) {
    const output = await db.query<T_OUT[TName]>(
      `UPDATE ${table} SET ${getColumnNames(data)} = ${getPlaceholders(Object.keys(data).length)}
      ${getConditionals(conditions)} RETURNING *;`,
      Object.values(data),
    );
    return parseOutput(output.rows);
  }

  async function timestamp<
    TName extends TableNames,
    TCol extends keyof T_OUT[TName],
  >(table: TName, column: TCol, conditions: Partial<T_OUT[TName]>) {
    const output = await db.query<Pick<T_OUT[TName], TCol>>(
      `UPDATE ${table} SET ${String(column)} = NOW()
      ${getConditionals(conditions)} RETURNING ${String(column)};`,
    );
    return parseOutput(output.rows)[0][column];
  }

  function getColumnNames(data: Partial<T_OUT[TableNames] | T_IN[TableNames]>) {
    return `(${Object.keys(data).join(", ")})`;
  }

  function getPlaceholders(length: number) {
    return `(${Array.from({ length }, (_v, idx) => `$${String(idx + 1)}`).join(", ")})`;
  }

  function getConditionals(conditions?: Partial<T_OUT[TableNames]>) {
    return conditions
      ? " WHERE " +
          Object.entries(conditions)
            .map(([key, value]) => `${key} = ${String(value)}`)
            .join(" AND ")
      : "";
  }

  function parseOutput<T extends Partial<T_OUT[TableNames]>>(
    data: T[],
    errorMsg: string = "Database Error",
  ) {
    if (data.length === 0 || !data[0]) throw new Error(errorMsg);
    return data as [T, ...T[]];
  }

  return { create, get, update, timestamp, parseOutput, getJoin };
})();
