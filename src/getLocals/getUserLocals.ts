import User from "../models/usersModel.ts";
import extractKeys from "../utils/extractKeys.ts";

interface UserLocals {
  user: User;
  t_id: number | null;
}

export default function ({ user, t_id }: UserLocals) {
  return {
    view: "user",
    viewData: {
      user: extractKeys(user, ["u_id", "u_name", "u_role"]),
      t_id,
    },
  };
}
