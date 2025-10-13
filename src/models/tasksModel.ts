import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";

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

  constructor(data: OutTask) {
    this.t_id = data.t_id;
    this.t_type = data.t_type;
    this.placed = data.placed;
    this.started = data.started;
    this.completed = data.completed;
  }

  static async get(data: Partial<OutTask>, limit?: number | null) {
    const output = await GeneralModel.get("tasks", {
      conditions: data,
      limit,
    });
    const tasks = output.map((task) => new Task(task));
    return GeneralModel.parseOutput(tasks, "Task Not Found");
  }

  static async getAll() {
    const output = await GeneralModel.get("tasks", { limit: 50 });
    return output.map((task) => new Task(task));
  }

  static async getNewByTypes(types: TaskType[]) {
    const [task] = await GeneralModel.getArray("tasks", "t_type", types, {
      order: ["placed"],
      conditions: { started: null },
    });
    if (!task) return null;
    return new Task(task);
  }

  async setStart(value: boolean = true) {
    if ((this.started && value) || (!this.started && !value))
      throw new Error(`Task ${String(this.t_id)} already started`);
    await this.#timestamp("started", value);
    return this;
  }

  async complete() {
    if (this.completed)
      throw new Error(`Task ${String(this.t_id)} already completed`);
    await this.#timestamp("completed");
    return this;
  }

  async #timestamp(column: "started" | "completed", value: boolean = true) {
    this[column] = await GeneralModel.timestamp(
      "tasks",
      column,
      {
        t_id: this.t_id,
      },
      value,
    );
  }

  async updateRels(data: Partial<OutTaskRel>) {
    const [rels] = await GeneralModel.update("taskRels", data, {
      t_id: this.t_id,
    });
    return Object.assign(this, rels);
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
    this.l_id = data.l_id;
    this.pa_id = data.pa_id;
    this.u_id = data.u_id;
  }

  static async create(
    data: InTask,
    pa_id: number,
    rels?: { u_id?: number | null; l_id?: number | null },
  ) {
    const output = await GeneralModel.create("tasks", data);
    const relsOutput = await GeneralModel.create("taskRels", {
      ...rels,
      pa_id,
      t_id: output.t_id,
    });
    return new FullTask(output, relsOutput);
  }

  static async getFull(
    data: Partial<OutTask>,
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

  static async getByRels(data: Partial<OutTaskRel>, limit?: number | null) {
    const output = await GeneralModel.getJoin<OutFullTask>(
      this.joinQuery,
      "b",
      { conditions: data, limit },
    );
    const tasks = output.map((task) => new FullTask(task, task));
    return GeneralModel.parseOutput(tasks, "Task Not Found");
  }

  static async getByComplete(complete: boolean) {
    const query = `SELECT * FROM 
    tasks a
    LEFT JOIN taskRels b
    ON a.t_id = b.t_id
    WHERE a.completed IS${complete ? " NOT" : ""} NULL
    ORDER BY a.placed
    LIMIT 20;`;
    const output = await db.query<OutFullTask>(query);
    return output.rows.map((task) => new FullTask(task, task));
  }

  static async getRels(task: Task) {
    const output = await GeneralModel.get("taskRels", {
      conditions: { t_id: task.t_id },
    });
    const [rels] = GeneralModel.parseOutput(output);
    return new FullTask(task, rels);
  }

  static async cancelTask(u_id: number) {
    const [task] = await FullTask.getByRels({ u_id });

    // Reset started timestamp & remove u_id from rels table
    await Promise.all([
      GeneralModel.update("taskRels", { u_id: null }, { u_id }),
      task.setStart(false),
    ]);
  }
}
