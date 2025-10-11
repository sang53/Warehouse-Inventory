import { T_OUT } from "../config/tableTypes.ts";

interface DisplayLocals {
  title: string;
  tableData: Partial<T_OUT[keyof T_OUT]>[];
}

export default function (tables: DisplayLocals[]) {
  return {
    view: "display",
    viewData: tables,
  };
}

/*
function assertValidDisplayLocals(
  data: Partial<DisplayLocals>,
): asserts data is DisplayLocals {
  const { title, tableData } = data;
  if (
    !title ||
    typeof title !== "string" ||
    !tableData ||
    !Array.isArray(tableData)
  ) {
    console.error("Invalid data for display: " + JSON.stringify(data));
    throw new Error("System Error");
  }
}
*/
