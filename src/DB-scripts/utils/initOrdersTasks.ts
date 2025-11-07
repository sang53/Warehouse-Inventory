import { PoolClient } from "pg";
import insertOrders from "./insertOrders.js";
import progressOrders from "./progressOrders.js";
import User from "../../models/usersModel.js";
import randInt from "./randInt.js";

const minIterations = 3;
const maxIterations = 5;

export default async function (
  client: PoolClient,
  pIds: number[],
  users: User[],
) {
  const iterations = randInt(maxIterations, minIterations);
  const taskUsers = users.filter(({ u_role }) => u_role !== "admin");

  for (let i = 0; i < iterations; i++) {
    await insertOrders(client, pIds);
    await progressOrders(client, taskUsers);
  }
}
