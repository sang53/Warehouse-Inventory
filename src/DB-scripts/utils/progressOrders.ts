import { PoolClient } from "pg";
import User from "../../models/usersModel.js";
import { completeTask, getCurrentTask } from "../../services/tasks.js";
import randInt from "./randInt.js";

const MIN_TASKS = 5;
const MAX_TASKS = 10;

export default async function (client: PoolClient, users: User[]) {
  await Promise.all(users.map((user) => randomTasks(client, user)));
}

async function randomTasks(client: PoolClient, user: User) {
  const numTasks = randInt(MAX_TASKS, MIN_TASKS);

  for (let i = 0; i < numTasks; i++) {
    const task = await getCurrentTask(user, client);
    if (!task) return;

    await completeTask(task, client);
  }
}
