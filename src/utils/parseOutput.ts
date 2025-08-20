import { T_OUT } from "../config/tableTypes.ts";

export default function <T extends T_OUT[keyof T_OUT]>(
  data: T[],
  errorMsg: string = "Database Error",
) {
  if (data.length === 0 || !data[0]) throw new Error(errorMsg);
  return data as [T, ...T[]];
}
