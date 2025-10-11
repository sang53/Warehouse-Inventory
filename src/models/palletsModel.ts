import { TNAMES } from "../config/tableSchema.ts";
import { T_OUT } from "../config/tableTypes.ts";
import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";

type PaOutput = T_OUT["PALLETS"];
type POutput = T_OUT["P_PA"];

// Basic Pallet Model
export default class Pallet {
  static PalletTable = "PALLETS" as const;
  pa_id: number;

  constructor({ pa_id }: PaOutput) {
    this.pa_id = pa_id;
  }

  static async create() {
    const output = await GeneralModel.create(Pallet.PalletTable);
    return new Pallet(output);
  }

  static async getAll() {
    const output = await GeneralModel.get(Pallet.PalletTable, {
      desc: true,
      order: ["pa_id"],
    });
    return output.map((pallet) => new Pallet(pallet));
  }

  async getProducts() {
    const output = await GeneralModel.get(ProductPallet.ProductTable, {
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

  // joins pallets & pallet_products table
  static joinQuery = `${TNAMES[ProductPallet.ProductTable]} AS a
  LEFT JOIN ${TNAMES[Pallet.PalletTable]} AS b
  ON a.pa_id = b.pa_id`;

  // Map: {p_id: stock}
  products: Map<number, number>;

  constructor(pallet: PaOutput, products: POutput[]) {
    super(pallet);
    this.products = this.#initProducts(products);
  }

  // create .products map
  #initProducts(products: POutput[]) {
    return new Map(products.map(({ p_id, stock }) => [p_id, stock]));
  }

  static async get(data: PaOutput) {
    const output = await GeneralModel.getJoin<PaOutput, POutput>(
      ProductPallet.joinQuery,
      "a",
      { conditions: data },
    );
    return new ProductPallet({ pa_id: data.pa_id }, output);
  }

  static async removeProducts(data: POutput[]) {
    const query = `
    UPDATE p_pa
    SET stock = stock - $1
    WHERE p_id = $2 AND pa_id = $3;`;

    await Promise.allSettled(
      data.map(({ p_id, pa_id, stock }) =>
        db.query(query, [stock, p_id, pa_id]),
      ),
    );
  }

  static async removePallet(pa_id: number) {
    await GeneralModel.remove("P_PA", { pa_id });
    await GeneralModel.remove("PALLETS", { pa_id });
  }

  async addProduct(p_id: number, stock: number) {
    const newStock = this.products.get(p_id) ?? 0 + stock;

    if (this.products.has(p_id))
      // product already on pallet => update existing row
      await GeneralModel.update(
        ProductPallet.ProductTable,
        { stock: newStock },
        { pa_id: this.pa_id, p_id },
      );
    else
      // create new row for product
      await GeneralModel.create(ProductPallet.ProductTable, {
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
