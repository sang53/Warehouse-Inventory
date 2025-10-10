import { T_IN, T_OUT, TaskType } from "../config/tableTypes.ts";
import { TNAMES } from "../config/tableSchema.ts";
import GeneralModel from "./generalModel.ts";
import db from "../config/pool.ts";

const TableName = "TASKS" as const;
const RelsTable = "TASKREL" as const;

type Input = T_IN[typeof TableName];
type Output = T_OUT[typeof TableName];
type Rels = T_OUT[typeof RelsTable];

export default class Task {
  t_id: number;
  t_type: TaskType;
  placed: string;
  started: string | null;
  completed: string | null;

  static table = TableName;

  constructor(data: Output) {
    this.t_id = data.t_id;
    this.t_type = data.t_type;
    this.placed = data.placed;
    this.started = data.started;
    this.completed = data.completed;
  }

  static async get(data: Partial<Output>, limit?: number | null) {
    const output = await GeneralModel.get(Task.table, {
      conditions: data,
      limit,
    });
    const tasks = output.map((task) => new Task(task));
    return GeneralModel.parseOutput(tasks, "Task Not Found");
  }

  static async getAll() {
    const output = await GeneralModel.get(Task.table, { limit: 50 });
    return output.map((task) => new Task(task));
  }

  static async getNewByTypes(types: TaskType[]) {
    const output = await GeneralModel.getArray(this.table, "t_type", types, {
      order: ["placed"],
      conditions: { started: null },
    });
    if (!output[0]) return null;
    return new Task(output[0]);
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
      Task.table,
      column,
      {
        t_id: this.t_id,
      },
      value,
    );
  }

  async updateRels(data: Partial<Rels>) {
    const output = await GeneralModel.update(FullTask.RelsTable, data, {
      t_id: this.t_id,
    });
    return Object.assign(this, output[0]);
  }
}

export class FullTask extends Task {
  static RelsTable = RelsTable;
  static joinQuery = `${TNAMES[Task.table]} a
    LEFT JOIN ${TNAMES[FullTask.RelsTable]} b
    ON a.t_id = b.t_id`;

  pa_id: number;
  l_id: number | null;
  u_id: number | null;

  constructor(task: Output, data: Rels) {
    super(task);
    this.l_id = data.l_id;
    this.pa_id = data.pa_id;
    this.u_id = data.u_id;
  }

  static async create(
    data: Input,
    pa_id: number,
    rels?: { u_id?: number | null; l_id?: number | null },
  ) {
    const output = await GeneralModel.create(Task.table, data);
    const relsOutput = await GeneralModel.create(this.RelsTable, {
      ...rels,
      pa_id,
      t_id: output.t_id,
    });
    return new FullTask(output, relsOutput);
  }

  static async getFull(
    data: Partial<Output & Rels>,
    order?: Extract<keyof Output | keyof Rels, string>[],
    limit?: number | null,
    desc?: boolean,
  ) {
    const output = await GeneralModel.getJoin<Output, Rels>(
      this.joinQuery,
      "a",
      { conditions: data, order, limit, desc },
    );
    const tasks = output.map((task) => new FullTask(task, task));
    return GeneralModel.parseOutput(tasks);
  }

  static async getByRels(data: Partial<Rels>, limit?: number | null) {
    const output = await GeneralModel.getJoin<Output, Rels>(
      this.joinQuery,
      "b",
      { conditions: data, limit },
    );
    const tasks = output.map((task) => new FullTask(task, task));
    return GeneralModel.parseOutput(tasks, "Task Not Found");
  }

  static async getByComplete(complete: boolean) {
    const query = `SELECT * FROM 
    ${TNAMES[Task.table]} a
    LEFT JOIN ${TNAMES[FullTask.RelsTable]} b
    ON a.t_id = b.t_id
    WHERE a.completed IS${complete ? " NOT" : ""} NULL
    ORDER BY a.placed
    LIMIT 20;`;
    const output = await db.query<Output & Rels>(query);
    return output.rows.map((task) => new FullTask(task, task));
  }

  static async getRels(task: Task) {
    const output = await GeneralModel.get(FullTask.RelsTable, {
      conditions: { t_id: task.t_id },
    });
    const rels = GeneralModel.parseOutput(output);
    return new FullTask(task, rels[0]);
  }

  static async cancelTask(u_id: number) {
    await GeneralModel.update(this.RelsTable, { u_id: null }, { u_id });
  }
}
