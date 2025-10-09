export const DISPLAY_DATA = {
  USER: ["u_role", "u_name", "u_id"],
  TASK: ["t_id", "t_type", "l_id", "placed", "started", "completed"],
  ORDER: ["o_id", "o_type", "placed", "completed", "t_id"],
  PALLET: ["pa_id"],
} as const;
