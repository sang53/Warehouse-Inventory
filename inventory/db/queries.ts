import type { PoolClient } from "pg";
import db from "./pool.ts";
import { LOCATION_ROLES, TABLESCHEMAS, TNAMES } from "./tableInfo.ts";

import type { T_IN, T_OUT } from "./tableInfo.ts";

export async function dropTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DROP TABLE ${Object.values(TNAMES).join(", ")} CASCADE;`,
    );
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error dropping tables: ", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function createTables() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    for (const schema of TABLESCHEMAS) {
      await client.query(schema);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
  } finally {
    client.release();
  }
}

export async function createDefaultLocations(height: number, width: number) {
  const LOCATIONS_DATA = Array.from({ length: height * width }, (_v, k) => {
    const row = Math.floor(k / width) + 1;
    const col = String.fromCharCode("A".charCodeAt(0) + (k % width));
    const role = LOCATION_ROLES[Math.floor(row / 3)] ?? "storage";
    return { l_name: `${String(row)}-${col}`, role };
  });
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await createLocations(LOCATIONS_DATA);
    await client.query("COMMIT");
  } catch (error) {
    console.error("Error inserting location:", error);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

export async function createLocations(
  input: T_IN["LOCATIONS"][],
  client?: PoolClient,
) {
  const connection = client || db;
  return await Promise.allSettled(
    input.map((location) => {
      if (location.pa_id)
        return connection.query(
          `INSERT INTO ${TNAMES.LOCATIONS} (l_name, role, pa_id) VALUES ($1, $2, $3) RETURNING l_id;`,
          [location.l_name, location.role, location.pa_id],
        );
      else
        return connection.query(
          `INSERT INTO ${TNAMES.LOCATIONS} (l_name, role) VALUES ($1, $2) RETURNING l_id;`,
          [location.l_name, location.role],
        );
    }),
  );
}

export async function getAllLocations(client?: PoolClient) {
  const connection = client || db;
  const result = await connection.query<T_OUT["LOCATIONS"]>(
    `SELECT * FROM ${TNAMES.LOCATIONS};`,
  );
  return result.rows;
}

export async function createProducts(
  products: T_IN["PRODUCTS"][],
  client?: PoolClient,
) {
  const connection = client || db;
  return await Promise.allSettled(
    products.map((product) =>
      connection.query<{ p_id: number }>(
        `INSERT INTO ${TNAMES.PRODUCTS} (p_name, price) VALUES ($1, $2) ON CONFLICT (p_name) DO NOTHING RETURNING p_id;`,
        [product.p_name, product.price],
      ),
    ),
  );
}

export async function getAllProducts(client?: PoolClient) {
  const connection = client || db;
  const result = await connection.query<T_OUT["PRODUCTS"]>(
    `SELECT * FROM ${TNAMES.PRODUCTS};`,
  );
  return result.rows;
}

export async function getProductById(id: number, client?: PoolClient) {
  const connection = client || db;
  const result = await connection.query<T_OUT["PRODUCTS"]>(
    `SELECT * FROM ${TNAMES.PRODUCTS} WHERE p_id = $1`,
    [id],
  );
  return result.rows;
}

export async function createPallets(number: number, client?: PoolClient) {
  const connection = client || db;
  return await Promise.allSettled(
    Array.from({ length: number }).map(() =>
      connection.query<{ pa_id: number }>(
        `INSERT INTO ${TNAMES.PALLETS} DEFAULT VALUES RETURNING pa_id;`,
      ),
    ),
  );
}

export async function getAllPallets(client?: PoolClient) {
  const connection = client || db;
  const result = await connection.query<T_OUT["PALLETS"]>(
    `SELECT * FROM ${TNAMES.PALLETS};`,
  );
  return result.rows;
}

export async function loadPallet(input: T_IN["P_PA"][], client?: PoolClient) {
  const connection = client || db;
  return await Promise.allSettled(
    input.map((item) =>
      connection.query(
        `INSERT INTO ${TNAMES.P_PA} (p_id, pa_id, stock) VALUES ($1, $2, $3);`,
        [item.p_id, item.pa_id, item.stock],
      ),
    ),
  );
}

export async function getAllPPA(client?: PoolClient) {
  const connection = client || db;
  const result = await connection.query<T_OUT["P_PA"]>(
    `SELECT * FROM ${TNAMES.P_PA};`,
  );
  return result.rows;
}
