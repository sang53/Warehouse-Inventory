import { FullTask } from "../models/tasksModel.js";
import User from "../models/usersModel.js";

interface UserLocals {
  user: User;
  t_id: number | null;
  tasks: FullTask[];
}

export default function ({ user, t_id, tasks }: UserLocals) {
  return {
    view: "user",
    viewData: {
      user,
      tasks,
      t_id,
    },
  };
}
