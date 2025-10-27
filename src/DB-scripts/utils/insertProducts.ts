import { PoolClient } from "pg";
import Product from "../../models/productsModel.ts";

const testProducts = [
  "Victoria Bitter",
  "Vodka Cruiser",
  "West Coast",
  "Little Fat Lamb",
  "Cass",
  "Corona",
  "Kloud",
  "Somersby Apple Cider",
  "Heineken Lager Beer",
  "Hahn Super Dry",
] as const;

export default async function (client: PoolClient) {
  await Promise.all(
    testProducts.map((p_name) => Product.create({ p_name }, client)),
  );
  return testProducts.length;
}
