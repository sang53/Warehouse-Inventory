import { PoolClient } from "pg";
import { createOrder } from "../../services/orders.ts";
import randInt from "./randInt.ts";

const numOrders = 10 as const;
const maxProducts = 5;
const maxStock = 5;

export default async function (client: PoolClient, NUM_PRODUCTS: number) {
  // create numOrders IN & OUT orders
  const o_types = Array.from({ length: numOrders }).flatMap(() => [
    { o_type: "IN" } as const,
    { o_type: "OUT" } as const,
  ]);

  // get random products & stocks for each order
  const orderData = getRandomOrders(o_types, NUM_PRODUCTS);

  // create order for each
  await Promise.all(
    orderData.map(({ o_type, products, stock }) =>
      createOrder(o_type, products, stock, client),
    ),
  );
}

function getRandomOrders(
  o_types: { o_type: "IN" | "OUT" }[],
  maxProductId: number,
) {
  const data = [];
  for (const { o_type } of o_types) {
    const numProducts = randInt(maxProducts);
    const { products, stock } = getProductsStocks(numProducts, maxProductId);
    data.push({ products, stock, o_type });
  }
  return data;
}

function getProductsStocks(numProducts: number, maxProductId: number) {
  // safeguard infinite loop
  if (maxProductId < numProducts)
    throw new Error("Insufficient products added to DB");

  const products = new Set<number>();
  do products.add(randInt(maxProductId));
  while (products.size < numProducts);

  const stock = Array.from({ length: numProducts }).map(() =>
    randInt(maxStock),
  );
  return { products: Array.from(products), stock };
}
