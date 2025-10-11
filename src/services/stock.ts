import Location from "../models/locationsModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";

export async function removeFromStorage(products: Map<number, number>) {
  const { data, missing } = await getProductInfo(products);
  // Handle case of not enough stock
  if (missing.length)
    throw new Error(`Not Enough Stock: ${JSON.stringify(missing)}`);

  // remove stock from storage pallets
  await ProductPallet.removeProducts(data);
}

export async function getProductInfo(products: Map<number, number>) {
  const output = await Location.getByProducts(products);

  const data: typeof output = [];
  // keep track of how much stock required for each product
  const remainder = new Map(products);

  // get locations names & amount of stock to take for each product
  output.forEach(({ l_name, p_id, stock, pa_id }) => {
    if (!remainder.get(p_id)) return;
    const required = remainder.get(p_id) ?? 0;
    if (required > stock) {
      // location does not have enough stock
      data.push({ l_name, p_id, stock, pa_id });
      remainder.set(p_id, required - stock);
    } else {
      // location has enough stock
      data.push({ l_name, p_id, stock: required, pa_id });
      remainder.delete(p_id);
    }
  });

  // get products with not enough stock
  const missing = Array.from(remainder.entries());
  return { data, missing };
}
