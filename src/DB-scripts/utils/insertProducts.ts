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
];

export default async function () {
  await Promise.all(testProducts.map((p_name) => Product.create({ p_name })));
}
