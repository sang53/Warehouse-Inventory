import { PoolClient } from "pg";
import { createOrder } from "../../services/orders.js";
import randInt from "./randInt.js";

const numOrders = 10 as const;
const maxProducts = 5;
const maxStock = 5;

export default async function (client: PoolClient, pIds: number[]) {
  // create numOrders IN & OUT orders
  const o_types = Array.from({ length: numOrders }).flatMap(() => [
    { o_type: "IN" } as const,
    { o_type: "OUT" } as const,
  ]);

  // get random products & stocks for each order
  const orderData = getRandomOrders(o_types, pIds);

  // create order for each
  await Promise.all(
    orderData.map(({ o_type, products, stock }) =>
      createOrder(o_type, products, stock, client),
    ),
  );
}

function getRandomOrders(o_types: { o_type: "IN" | "OUT" }[], pIds: number[]) {
  const data = [];
  for (const { o_type } of o_types) {
    const numProducts = randInt(maxProducts);
    const { products, stock } = getProductsStocks(numProducts, pIds);
    data.push({ products, stock, o_type });
  }
  return data;
}

function getProductsStocks(numProducts: number, pIds: number[]) {
  // safeguard infinite loop
  if (pIds.length < numProducts)
    throw new Error("Insufficient products added to DB");

  const products = new Set<number>();
  do {
    const p_id = pIds[randInt(pIds.length - 1, 0)];
    if (p_id) products.add(p_id);
  } while (products.size < numProducts);

  const stock = Array.from({ length: numProducts }).map(() =>
    randInt(maxStock),
  );
  return { products: Array.from(products), stock };
}
