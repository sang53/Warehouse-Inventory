import { Status, T_OUT } from "../config/tableTypes.ts";
import db from "../config/pool.ts";
<<<<<<< HEAD
import { TNAMES } from "../config/tableSchema.ts";
import Pallet from "./palletsModel.ts";
import parseOutput from "../utils/parseOutput.ts";
=======
>>>>>>> 3927aec (create basic models)

export default class Task {
  t_id: number;
  from_l_id: number | null;
  to_l_id: number | null;
  pa_id: number | null;
  u_id: number | null;
  t_status: Status;
<<<<<<< HEAD
  complete: string | null;
=======
>>>>>>> 3927aec (create basic models)

  constructor(taskData: T_OUT["TASKS"]) {
    this.t_id = taskData.t_id;
    this.from_l_id = taskData.from_l_id;
    this.to_l_id = taskData.to_l_id;
    this.pa_id = taskData.pa_id;
    this.u_id = taskData.u_id;
    this.t_status = taskData.t_status;
    this.complete = taskData.complete;
  }

  async addPallet(pallet: Pallet) {
    if (this.pa_id) {
      throw new Error(`Pallet already assigned to task`);
    }
    await db.query(
      `UPDATE ${TNAMES.PALLETS} 
      SET pa_id = $1
      WHERE t_id = $2;`,
      [pallet.pa_id, this.t_id],
    );
    this.pa_id = pallet.pa_id;
    return this;
  }

  async setComplete() {
    if (this.complete)
      throw new Error(`Task ${String(this.t_id)} Already Completed`);
    const data = await db.query<T_OUT["ORDERS"]>(
      `UPDATE ${TNAMES.ORDERS} 
      SET complete = NOW()::timestamp
      WHERE t_id = $1;`,
      [this.t_id],
    );
    const taskData = parseOutput(
      data.rows,
      `Task ${String(this.t_id)} does not exist`,
    );
    this.complete = taskData[0].complete;
    return this;
  }

  static async getTask(id: number) {
    const data = await db.query<T_OUT["TASKS"]>(
      `SELECT * FROM ${TNAMES.TASKS} WHERE t_id = $1`,
      [id],
    );
    if (!data.rows.length || !data.rows[0])
      throw new Error(`Task ID ${String(id)} Not Found`);
    return new Task(data.rows[0]);
  }

  static async getAllTasks() {
    const data = await db.query<T_OUT["TASKS"]>(
      `SELECT * FROM ${TNAMES.TASKS};`,
    );
    return data.rows.map((task) => new Task(task));
  }
}
