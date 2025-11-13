import GeneralModel from "./generalModel.js";
import db from "../config/pool.js";
export default class Task {
    t_id;
    t_type;
    placed;
    started;
    completed;
    o_id;
    constructor(data) {
        this.t_id = data.t_id;
        this.t_type = data.t_type;
        this.placed = GeneralModel.parseTimestamp(data.placed);
        this.started = GeneralModel.parseTimestamp(data.started);
        this.completed = GeneralModel.parseTimestamp(data.completed);
    }
    // returns a new task by array of t_types
    static async getNewByTypes(types, client) {
        const [task] = await GeneralModel.getArray("tasks", "t_type", types, {
            order: ["placed"],
            conditions: { started: null },
        }, client);
        if (!task)
            return null;
        return new Task(task);
    }
    async setStart(value, client) {
        if (Boolean(this.started) === value) {
            // throw error if task already started/cancelled
            console.error(`Task ${String(this.t_id)} setting .start ${String(value)}`);
            throw new Error("System Error");
        }
        await this.#timestamp("started", value, client);
        return this;
    }
    async complete(client) {
        if (this.completed) {
            // throw error if task already completed
            console.error(`Task ${String(this.t_id)} setting .complete`);
            throw new Error("System Error");
        }
        await this.#timestamp("completed", true, client);
        return this;
    }
    async updateRels(data, client) {
        const [rels] = await GeneralModel.update("taskRels", data, {
            t_id: this.t_id,
        }, client);
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
    async #timestamp(column, value, client) {
        const timestamp = await GeneralModel.timestamp("tasks", column, {
            t_id: this.t_id,
        }, value, client);
        this[column] = GeneralModel.parseTimestamp(timestamp);
    }
}
export class FullTask extends Task {
    static joinQuery = `tasks a
    LEFT JOIN taskRels b
    ON a.t_id = b.t_id`;
    pa_id;
    l_id;
    u_id;
    constructor(task, data) {
        super(task);
        this.pa_id = data.pa_id;
        this.l_id = data.l_id;
        this.u_id = data.u_id;
    }
    static async create(client, data, pa_id, rels) {
        const output = await GeneralModel.create("tasks", data, client);
        const relsOutput = await GeneralModel.create("taskRels", {
            ...rels,
            pa_id,
            t_id: output.t_id,
        }, client);
        return new FullTask(output, relsOutput);
    }
    static async getFull(data, order, limit, desc) {
        const output = await GeneralModel.getJoin(this.joinQuery, "a", { conditions: data, order, limit, desc });
        const tasks = output.map((task) => new FullTask(task, task));
        return GeneralModel.parseOutput(tasks);
    }
    static async getAll(order = ["t_id"]) {
        return this.getFull(undefined, order, null);
    }
    static async getByRels(data, limit) {
        const output = await GeneralModel.getJoin(this.joinQuery, "b", { conditions: data, limit });
        return output.map((task) => new FullTask(task, task));
    }
    static async getByComplete(complete, t_types, limit) {
        const query = `SELECT * FROM 
    ${this.joinQuery}
    LEFT JOIN o_t c
    ON a.t_id = c.t_id
    WHERE a.completed IS${complete ? " NOT" : ""} NULL
    ${t_types ? "AND a.t_type = ANY($1)" : ""}
    ORDER BY a.placed
    ${limit ? "LIMIT " + String(limit) : ""};`;
        const { rows } = await db.query(query, t_types ? [t_types] : []);
        return rows.map((task) => {
            const fulltask = new FullTask(task, task);
            fulltask.o_id = task.o_id;
            return fulltask;
        });
    }
    static async getRels(task) {
        const output = await GeneralModel.get("taskRels", {
            conditions: { t_id: task.t_id },
        });
        const [rels] = GeneralModel.parseOutput(output);
        return new FullTask(task, rels);
    }
    static async getCurrentByUser(u_id, client) {
        const query = `
      SELECT * FROM tasks a
      JOIN taskRels b
      ON a.t_id = b.t_id
      WHERE a.started IS NOT NULL
      AND a.completed IS NULL
      ${u_id ? "AND b.u_id = $1" : ""};`;
        const connection = client ?? db;
        const { rows } = await connection.query(query, u_id ? [u_id] : []);
        return rows.map((taskData) => new FullTask(taskData, taskData));
    }
    static async getByLocation(l_id, limit = 1) {
        const query = `
    SELECT * from tasks a
    JOIN taskRels b
    ON a.t_id = b.t_id
    WHERE b.l_id = $1
    AND a.completed IS NULL
    LIMIT ${String(limit)};`;
        const { rows: [taskData], } = await db.query(query, [l_id]);
        return taskData ? new FullTask(taskData, taskData) : null;
    }
}
