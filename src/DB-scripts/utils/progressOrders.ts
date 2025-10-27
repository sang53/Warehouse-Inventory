import { PoolClient } from "pg";
import User from "../../models/usersModel.ts";
import { completeTask, getCurrentTask } from "../../services/tasks.ts";
import randInt from "./randInt.ts";

const MAX_TASKS = 10;

export default async function (client: PoolClient, users: User[]) {
  await Promise.all(users.map((user) => randomTasks(client, user)));
}

async function randomTasks(client: PoolClient, user: User) {
  const numTasks = randInt(MAX_TASKS);

  for (let i = 0; i < numTasks; i++) {
    const task = await getCurrentTask(user, true, client);
    if (!task) return;

    await completeTask(task, client);
  }
}
