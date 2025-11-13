import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
// Basic Pallet Model
export default class Pallet {
    pa_id;
    created;
    constructor({ pa_id, created }) {
        this.pa_id = pa_id;
        this.created = GeneralModel.parseTimestamp(created);
    }
    static async create(client) {
        const output = await GeneralModel.create("pallets", undefined, client);
        return new Pallet(output);
    }
    static async getAll() {
        const output = await GeneralModel.get("pallets", {
            desc: true,
            order: ["created"],
            limit: null,
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
    static ProductTable = "P_PA";
    // Map: {p_id: stock}
    products;
    constructor(pallet, products) {
        super(pallet);
        this.products = this.#initProducts(products);
    }
    // create .products map
    #initProducts(products) {
        return new Map(products.map(({ p_id, stock }) => [p_id, stock]));
    }
    static async get({ pa_id }) {
        const pallet = await GeneralModel.get("pallets", {
            conditions: { pa_id },
        });
        const [{ created }] = GeneralModel.parseOutput(pallet);
        const productOutput = await GeneralModel.get("p_pa", {
            conditions: { pa_id },
            limit: null,
        });
        return new ProductPallet({ pa_id, created }, productOutput);
    }
    static async removePallet(pa_id, client) {
        // rows from p_pa deleted automatically through cascade
        await GeneralModel.remove("pallets", { pa_id }, client);
    }
    static async removeEmpty(paIds, client) {
        const productsQuery = `
    DELETE FROM p_pa
    WHERE pa_id = ANY($1)
    AND stock = 0
    RETURNING pa_id;`;
        const { rows: removedIds } = await client.query(productsQuery, [
            paIds,
        ]);
        if (!removedIds.length)
            return;
        const uniqueIds = new Set(removedIds.map((row) => row.pa_id));
        const palletQuery = `
    DELETE FROM pallets p
    WHERE p.pa_id = ANY($1)
    AND NOT EXISTS (SELECT 1 FROM p_pa WHERE pa_id = p.pa_id);`;
        await db.query(palletQuery, [Array.from(uniqueIds)]);
    }
    async addProduct(p_id, stock) {
        const newStock = this.products.get(p_id) ?? 0 + stock;
        if (this.products.has(p_id))
            // product already on pallet => update existing row
            await GeneralModel.update("p_pa", { stock: newStock }, { pa_id: this.pa_id, p_id });
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
    static async modifyProducts(productData, client, operator) {
        const placeholders = productData
            .map((_, idx) => {
            return `($${String(idx * 3 + 1)}, $${String(idx * 3 + 2)}, $${String(idx * 3 + 3)})`;
        })
            .join(", ");
        const values = productData.flatMap(({ p_id, pa_id, stock }) => [
            p_id,
            pa_id,
            stock,
        ]);
        const query = `
    INSERT INTO p_pa (p_id, pa_id, stock)
    VALUES ${placeholders}
    ON CONFLICT (p_id, pa_id)
    DO UPDATE SET stock = p_pa.stock ${operator} EXCLUDED.stock
    RETURNING p_pa.pa_id;`;
        const { rows } = await client.query(query, values);
        return rows.map(({ pa_id }) => pa_id);
    }
}
