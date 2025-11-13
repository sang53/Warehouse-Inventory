import db from "../config/pool.js";
export default (function () {
    async function create(table, data, client) {
        const connection = client ?? db;
        const queryValues = data
            ? `${getColumnNames(data)} VALUES ${getPlaceholders(Object.keys(data).length)}`
            : "DEFAULT VALUES";
        const query = `INSERT INTO ${table} ${queryValues} RETURNING *;`;
        const values = getValues(data, false);
        const output = await connection.query(query, values);
        return parseOutput(output.rows)[0];
    }
    async function get(table, { order, limit = 1, desc = false, conditions, } = {}, client) {
        let query = `SELECT * FROM ${table}`;
        query += getConditionals(1, conditions);
        query += getOrder(order, desc);
        query += getLimit(limit);
        query += ";";
        const connection = client ?? db;
        const output = await connection.query(query, getValues(conditions));
        return output.rows;
    }
    async function getJoin(join, tableName, { order, limit = 1, desc = false, conditions } = {}, client) {
        const tablePrefix = tableName ? tableName + "." : "";
        let query = `SELECT * FROM ${join}`;
        query += getConditionals(1, conditions, tablePrefix);
        query += getOrder(order, desc, tablePrefix);
        query += getLimit(limit);
        query += ";";
        const connection = client ?? db;
        const output = await connection.query(query, getValues(conditions));
        return output.rows;
    }
    async function getArray(table, column, values, { order, limit = 1, desc = false, conditions, }, client) {
        const CValues = getValues(conditions);
        const CQuery = conditions
            ? getConditionals(1, conditions) +
                ` AND ${column} = ANY($${String(CValues.length + 1)})`
            : ` WHERE ${column} = ANY($1)`;
        const connection = client ?? db;
        const output = await connection.query(`SELECT * from ${table}${CQuery}${getOrder(order, desc)}${getLimit(limit)};`, [...CValues, values]);
        return output.rows;
    }
    async function update(table, data, conditions, client) {
        const connection = client ?? db;
        const dataPlaceholder = Object.keys(data).length;
        const output = await connection.query(`UPDATE ${table} SET ${getColumnNames(data)} = ROW${getPlaceholders(dataPlaceholder)}
      ${getConditionals(dataPlaceholder + 1, conditions)} RETURNING *;`, Object.values(data).concat(getValues(conditions)));
        return output.rows;
    }
    async function remove(table, conditions, client) {
        const connection = client ?? db;
        const query = `DELETE FROM ${table}
    ${getConditionals(1, conditions)};`;
        await connection.query(query, getValues(conditions));
    }
    async function timestamp(table, column, conditions, value, connection) {
        const client = connection ?? db;
        const output = await client.query(`UPDATE ${table} SET ${String(column)} = ${value ? "NOW()" : "NULL"}
      ${getConditionals(1, conditions)} RETURNING ${String(column)};`, getValues(conditions));
        return parseOutput(output.rows)[0][column];
    }
    function getColumnNames(data) {
        return `(${Object.keys(data).join(", ")})`;
    }
    function getPlaceholders(length) {
        return `(${Array.from({ length }, (_v, idx) => `$${String(idx + 1)}`).join(", ")})`;
    }
    function getConditionals(placeholder, conditions, tablePrefix) {
        if (!conditions)
            return "";
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
    function parseOutput(data, errorMsg = "Database Error") {
        if (data.length === 0 || !data[0])
            throw new Error(errorMsg);
        return data;
    }
    function getValues(data, excludeNull = true) {
        const values = data ? Object.values(data) : [];
        return excludeNull ? values.filter((value) => value !== null) : values;
    }
    function getOrder(order, desc, tablePrefix) {
        if (!order)
            return "";
        if (tablePrefix)
            order = order.map((column) => tablePrefix + column);
        return ` ORDER BY ${order.join(", ")}${desc ? " DESC" : ""}`;
    }
    function getLimit(limit) {
        return limit ? ` LIMIT ${String(limit)}` : "";
    }
    function parseTimestamp(timestamp) {
        if (!timestamp)
            return null;
        return new Date(timestamp).toISOString();
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
        parseTimestamp,
    };
})();
