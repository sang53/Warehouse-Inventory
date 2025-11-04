import { PoolClient } from "pg";
import Location from "../models/locationsModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";

export async function removeFromStorage(
  products: Map<number, number>,
  client: PoolClient,
) {
  const { data, missing } = await getProductInfo(products, client);
  // Handle case of not enough stock
  if (missing.length)
    throw new Error(`Not Enough Stock: ${JSON.stringify(missing)}`);

  // remove stock from storage pallets
  const paIds = await ProductPallet.modifyProducts(data, client, "-");
  // remove empty storage pallets
  // locations.pa_id automatically set to null through SET NULL
  await ProductPallet.removeEmpty(paIds, client);
}

export async function getProductInfo(
  products: Map<number, number>,
  client?: PoolClient,
) {
  const output = await Location.getByProducts(products, client);
  const data: typeof output = [];

  // keep track of how much stock required for each product
  const remainder = new Map(products);

  // get locations names & amount of stock to take for each product
  output.forEach(({ l_name, p_id, stock, pa_id }) => {
    if (!remainder.get(p_id))
      // product already retrieved from locations
      return;

    const required = remainder.get(p_id) ?? 0;
    if (required > stock) {
      // location does not have enough stock:
      // take all available stock from location
      data.push({ l_name, p_id, stock, pa_id });

      // update required amount of stock
      remainder.set(p_id, required - stock);
    } else {
      // location has enough stock:
      // retrieve required stock from location
      data.push({ l_name, p_id, stock: required, pa_id });

      // product no longer needed
      remainder.delete(p_id);
    }
  });

  // get products with not enough stock
  const missing = Array.from(remainder.keys());
  return { data, missing };
}

export function mapToProductStock(map: Map<number, number>, pa_id: number) {
  const output = [];

  for (const [p_id, stock] of map) {
    output.push({ pa_id, p_id, stock });
  }

  return output;
}
