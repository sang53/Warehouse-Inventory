import { PoolClient } from "pg";
import insertOrders from "./insertOrders.ts";
import progressOrders from "./progressOrders.ts";
import User from "../../models/usersModel.ts";
import randInt from "./randInt.ts";

const maxIterations = 5;

export default async function (
  client: PoolClient,
  NUM_PRODUCTS: number,
  users: User[],
) {
  const iterations = randInt(maxIterations);
  const taskUsers = users.filter(({ u_role }) => u_role !== "admin");

  for (let i = 0; i < iterations; i++) {
    await insertOrders(client, NUM_PRODUCTS);
    await progressOrders(client, taskUsers);
  }
}
