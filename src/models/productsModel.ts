import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
import { PoolClient } from "pg";
import { ProductStock } from "./palletsModel.js";
import { OutLocation } from "./locationsModel.js";

export interface InProduct {
  p_name: string;
}

export interface OutProduct extends InProduct {
  p_id: number;
}
interface ProductStocks {
  p_id: number;
  p_name: string;
  storage: number;
  incoming: number;
  outgoing: number;
  net_stock: number;
}
export default class Product {
  p_name: string;
  p_id: number;

  constructor(data: OutProduct) {
    this.p_name = data.p_name;
    this.p_id = data.p_id;
  }

  static async create(data: InProduct, client?: PoolClient) {
    const output = await GeneralModel.create("products", data, client);
    return new Product(output);
  }

  static async get(data: Partial<OutProduct>, limit?: number | null) {
    const output = await GeneralModel.get("products", {
      conditions: data,
      limit,
    });
    const products = output.map((product) => new Product(product));
    return GeneralModel.parseOutput(products, "Product Not Found");
  }

  static async getAll() {
    const output = await GeneralModel.get("products", { limit: 50 });
    return output.map((product) => new Product(product));
  }

  static async update(
    data: Partial<OutProduct>,
    conditions?: Partial<OutProduct>,
  ) {
    const output = await GeneralModel.update("products", data, conditions);
    return output.map((product) => new Product(product));
  }

  static async getAllStock(order: "sub.p_id" | "net_stock") {
    const storage_totals = `
    WITH storage_totals as (
    SELECT p.p_id, SUM(pa.stock) as storage
    FROM products p
    LEFT JOIN p_pa pa ON p.p_id = pa.p_id
    LEFT JOIN locations l ON pa.pa_id = l.pa_id
    WHERE l.l_role = 'storage'
    GROUP BY p.p_id),`;
    const order_totals = `
    order_totals AS (
    SELECT op.p_id,
      SUM(CASE WHEN o.o_type = 'IN' THEN op.stock ELSE 0 END) AS incoming,
      SUM(CASE WHEN o.o_type = 'OUT' THEN op.stock ELSE 0 END) AS outgoing
    FROM o_p op
    JOIN orders o ON o.o_id = op.o_id
    WHERE o.completed IS NULL
    GROUP BY op.p_id)`;
    const query = `
    SELECT sub.p_id, sub.p_name, sub.storage, sub.incoming, sub.outgoing,
    (sub.storage + sub.incoming - sub.outgoing) as net_stock
    FROM (
      SELECT p.p_id, p.p_name,
        COALESCE(s.storage, 0) as storage,
        COALESCE(o.incoming, 0) AS incoming,
        COALESCE(o.outgoing, 0) AS outgoing
      FROM products p
      LEFT JOIN storage_totals s ON p.p_id = s.p_id
      LEFT JOIN order_totals o ON p.p_id = o.p_id
    ) AS sub
    ORDER BY ${order};`;

    const { rows } = await db.query<ProductStocks>(
      storage_totals + order_totals + query,
    );
    return rows;
  }

  static async getStockByProduct(p_id: number) {
    const query = `
    SELECT 
      p.p_id,
      p.p_name,
      COALESCE(storage.stock, 0) AS storage,
      COALESCE(incoming.stock, 0) AS incoming,
      COALESCE(outgoing.stock, 0) AS outgoing,
      COALESCE(storage.stock, 0) + COALESCE(incoming.stock, 0) - COALESCE(outgoing.stock, 0) AS net_stock
    FROM products p
    -- storage aggregate
    LEFT JOIN (
      SELECT pa.p_id, SUM(pa.stock) AS stock
      FROM p_pa pa
      JOIN locations l ON l.pa_id = pa.pa_id
      WHERE l.l_role = 'storage'
      GROUP BY pa.p_id
    ) AS storage ON storage.p_id = p.p_id
    -- incoming aggregate
    LEFT JOIN (
      SELECT op.p_id, SUM(op.stock) AS stock
      FROM o_p op
      JOIN orders o ON o.o_id = op.o_id
      WHERE o.o_type = 'IN' AND o.completed IS NULL
      GROUP BY op.p_id
    ) AS incoming ON incoming.p_id = p.p_id
    -- outgoing aggregate
    LEFT JOIN (
      SELECT op.p_id, SUM(op.stock) AS stock
      FROM o_p op
      JOIN orders o ON o.o_id = op.o_id
      WHERE o.o_type = 'OUT' AND o.completed IS NULL
      GROUP BY op.p_id
    ) AS outgoing ON outgoing.p_id = p.p_id
    WHERE p.p_id = $1;`;
    const { rows } = await db.query<ProductStocks>(query, [p_id]);
    const [product] = GeneralModel.parseOutput(
      rows,
      `Product ${String(p_id)} Not Found`,
    );
    return product;
  }

  static async getPalletLocation(p_id: number) {
    type OutputType = OutProduct & OutLocation & ProductStock;
    const query = `
    SELECT a.pa_id, a.stock, b.l_id, b.l_name FROM p_pa a
    LEFT JOIN locations b
    ON a.pa_id = b.pa_id
    WHERE a.p_id = $1
    ORDER BY a.stock DESC;`;

    const output = await db.query<OutputType>(query, [p_id]);
    return output.rows;
  }
}
