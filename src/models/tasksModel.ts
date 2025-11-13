import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
import { PoolClient } from "pg";

export interface InTask {
  t_type: TaskType;
}

export interface OutTask extends InTask {
  t_id: number;
  placed: string;
  started: string | null;
  completed: string | null;
}

export interface InTaskRel {
  t_id: number;
  l_id?: number | null;
  pa_id: number;
  u_id?: number | null;
}

export interface OutTaskRel extends InTaskRel {
  l_id: number | null;
  pa_id: number;
  u_id: number | null;
}

type OutFullTask = OutTask & OutTaskRel;

export type TaskType =
  | "arrival"
  | "intake"
  | "storage"
  | "pick"
  | "outgoing"
  | "export";

export default class Task {
  t_id: number;
  t_type: TaskType;
  placed: string;
  started: string | null;
  completed: string | null;
  o_id?: number;

  constructor(data: OutTask) {
    this.t_id = data.t_id;
    this.t_type = data.t_type;
    this.placed = GeneralModel.parseTimestamp(data.placed);
    this.started = GeneralModel.parseTimestamp(data.started);
    this.completed = GeneralModel.parseTimestamp(data.completed);
  }

  // returns a new task by array of t_types
  static async getNewByTypes(types: TaskType[], client?: PoolClient) {
    const [task] = await GeneralModel.getArray(
      "tasks",
      "t_type",
      types,
      {
        order: ["placed"],
        conditions: { started: null },
      },
      client,
    );
    if (!task) return null;
    return new Task(task);
  }

  async setStart(value: boolean, client?: PoolClient) {
    if (Boolean(this.started) === value) {
      // throw error if task already started/cancelled
      console.error(
        `Task ${String(this.t_id)} setting .start ${String(value)}`,
      );
      throw new Error("System Error");
    }

    await this.#timestamp("started", value, client);
    return this;
  }

  async complete(client: PoolClient) {
    if (this.completed) {
      // throw error if task already completed
      console.error(`Task ${String(this.t_id)} setting .complete`);
      throw new Error("System Error");
    }

    await this.#timestamp("completed", true, client);
    return this;
  }

  async updateRels(data: Partial<OutTaskRel>, client?: PoolClient) {
    const [rels] = await GeneralModel.update(
      "taskRels",
      data,
      {
        t_id: this.t_id,
      },
      client,
    );
    return Object.assign(this, rels);
  }

  async cancelTask() {
    // Reset started timestamp & remove u_id from rels table
    await Promise.all([
      GeneralModel.update("taskRels", { u_id: null }, { t_id: this.t_id }),
      this.setStart(false),
    ]);
  }

  // sets/removes timestamp for given column
  async #timestamp(
    column: "started" | "completed",
    value: boolean,
    client?: PoolClient,
  ) {
    const timestamp = await GeneralModel.timestamp(
      "tasks",
      column,
      {
        t_id: this.t_id,
      },
      value,
      client,
    );
    this[column] = GeneralModel.parseTimestamp(timestamp);
  }
}

export class FullTask extends Task {
  static joinQuery = `tasks a
    LEFT JOIN taskRels b
    ON a.t_id = b.t_id`;

  pa_id: number;
  l_id: number | null;
  u_id: number | null;

  constructor(task: OutTask, data: OutTaskRel) {
    super(task);
    this.pa_id = data.pa_id;
    this.l_id = data.l_id;
    this.u_id = data.u_id;
  }

  static async create(
    client: PoolClient,
    data: InTask,
    pa_id: number,
    rels?: { u_id?: number | null; l_id?: number | null },
  ) {
    const output = await GeneralModel.create("tasks", data, client);
    const relsOutput = await GeneralModel.create(
      "taskRels",
      {
        ...rels,
        pa_id,
        t_id: output.t_id,
      },
      client,
    );
    return new FullTask(output, relsOutput);
  }

  static async getFull(
    data?: Partial<OutTask>,
    order?: Extract<keyof OutTask, string>[],
    limit?: number | null,
    desc?: boolean,
  ) {
    const output = await GeneralModel.getJoin<OutFullTask>(
      this.joinQuery,
      "a",
      { conditions: data, order, limit, desc },
    );
    const tasks = output.map((task) => new FullTask(task, task));
    return GeneralModel.parseOutput(tasks);
  }

  static async getAll(order: Extract<keyof OutTask, string>[] = ["t_id"]) {
    return this.getFull(undefined, order, null);
  }

  static async getByRels(data: Partial<OutTaskRel>, limit?: number | null) {
    const output = await GeneralModel.getJoin<OutFullTask>(
      this.joinQuery,
      "b",
      { conditions: data, limit },
    );
    return output.map((task) => new FullTask(task, task));
  }

  static async getByComplete(
    complete: boolean,
    t_types?: TaskType[],
    limit?: number,
  ) {
    const query = `SELECT * FROM 
    ${this.joinQuery}
    LEFT JOIN o_t c
    ON a.t_id = c.t_id
    WHERE a.completed IS${complete ? " NOT" : ""} NULL
    ${t_types ? "AND a.t_type = ANY($1)" : ""}
    ORDER BY a.placed
    ${limit ? "LIMIT " + String(limit) : ""};`;
    const { rows } = await db.query<OutFullTask & { o_id: number }>(
      query,
      t_types ? [t_types] : [],
    );
    return rows.map((task) => {
      const fulltask = new FullTask(task, task);
      fulltask.o_id = task.o_id;
      return fulltask;
    });
  }

  static async getRels(task: Task) {
    const output = await GeneralModel.get("taskRels", {
      conditions: { t_id: task.t_id },
    });
    const [rels] = GeneralModel.parseOutput(output);
    return new FullTask(task, rels);
  }

  static async getCurrentByUser(u_id?: number, client?: PoolClient) {
    const query = `
      SELECT * FROM tasks a
      JOIN taskRels b
      ON a.t_id = b.t_id
      WHERE a.started IS NOT NULL
      AND a.completed IS NULL
      ${u_id ? "AND b.u_id = $1" : ""};`;

    const connection = client ?? db;

    const { rows } = await connection.query<OutFullTask>(
      query,
      u_id ? [u_id] : [],
    );
    return rows.map((taskData) => new FullTask(taskData, taskData));
  }

  static async getByLocation(l_id: number, limit: number = 1) {
    const query = `
    SELECT * from tasks a
    JOIN taskRels b
    ON a.t_id = b.t_id
    WHERE b.l_id = $1
    AND a.completed IS NULL
    LIMIT ${String(limit)};`;

    const {
      rows: [taskData],
    } = await db.query<OutFullTask>(query, [l_id]);
    return taskData ? new FullTask(taskData, taskData) : null;
  }
}
