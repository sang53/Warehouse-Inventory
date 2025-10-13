import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";

export interface OutPallet {
  pa_id: number;
}

export interface ProductStock {
  p_id: number;
  stock: number;
}

// Basic Pallet Model
export default class Pallet {
  pa_id: number;

  constructor({ pa_id }: OutPallet) {
    this.pa_id = pa_id;
  }

  static async create() {
    const output = await GeneralModel.create("pallets");
    return new Pallet(output);
  }

  static async getAll() {
    const output = await GeneralModel.get("pallets", {
      desc: true,
      order: ["pa_id"],
    });
    return output.map((pallet) => new Pallet(pallet));
  }

  async getProducts() {
    const output = await GeneralModel.get("p_pa", {
      conditions: {
        pa_id: this.pa_id,
      },
      limit: null,
    });
    return new ProductPallet(this, output);
  }
}

// Pallet Model with Products
export class ProductPallet extends Pallet {
  static ProductTable = "P_PA" as const;

  // Map: {p_id: stock}
  products: Map<number, number>;

  constructor(pallet: OutPallet, products: ProductStock[]) {
    super(pallet);
    this.products = this.#initProducts(products);
  }

  // create .products map
  #initProducts(products: ProductStock[]) {
    return new Map(products.map(({ p_id, stock }) => [p_id, stock]));
  }

  static async get(data: OutPallet) {
    const output = await GeneralModel.get("p_pa", {
      conditions: data,
      limit: null,
    });
    return new ProductPallet({ pa_id: data.pa_id }, output);
  }

  static async removeProducts(data: (ProductStock & OutPallet)[]) {
    const values = data
      .map(
        (_, i) =>
          `($${String(i * 3 + 1)}::int, $${String(i * 3 + 2)}::int, $${String(i * 3 + 3)}::int)`,
      )
      .join(", ");

    const query = `
    UPDATE p_pa AS target
    SET stock = target.stock - v.stock
    FROM (
      VALUES ${values}
    ) AS v(p_id, pa_id, stock)
    WHERE target.p_id = v.p_id
      AND target.pa_id = v.pa_id
    RETURNING target.pa_id;`;

    const params = data.flatMap(({ p_id, pa_id, stock }) => [
      p_id,
      pa_id,
      stock,
    ]);
    const { rows: paIds } = await db.query<OutPallet>(query, params);
    return paIds.map(({ pa_id }) => pa_id);
  }

  static async removePallet(pa_id: number) {
    // rows from p_pa deleted automatically through cascade
    await GeneralModel.remove("pallets", { pa_id });
  }

  static async removeEmpty(paIds: number[]) {
    const productsQuery = `
    DELETE FROM p_pa
    WHERE pa_id = ANY($1)
    AND stock = 0
    RETURNING pa_id;`;

    const { rows: removedIds } = await db.query<OutPallet>(productsQuery, [
      paIds,
    ]);

    if (!removedIds.length) return;
    const uniqueIds = new Set(removedIds.map((row) => row.pa_id));

    const palletQuery = `
    DELETE FROM pallets p
    WHERE p.pa_id = ANY($1)
    AND NOT EXISTS (SELECT 1 FROM p_pa WHERE pa_id = p.pa_id);`;

    await db.query(palletQuery, [Array.from(uniqueIds)]);
  }

  async addProduct(p_id: number, stock: number) {
    const newStock = this.products.get(p_id) ?? 0 + stock;

    if (this.products.has(p_id))
      // product already on pallet => update existing row
      await GeneralModel.update(
        "p_pa",
        { stock: newStock },
        { pa_id: this.pa_id, p_id },
      );
    else
      // create new row for product
      await GeneralModel.create("p_pa", {
        stock,
        pa_id: this.pa_id,
        p_id,
      });

    this.products.set(p_id, newStock);
    return this;
  }

  async addProductsMap(products: Map<number, number>) {
    await Promise.allSettled(
      Array.from(products).map(([p_id, stock]) => {
        return this.addProduct(p_id, stock);
      }),
    );
  }
}
