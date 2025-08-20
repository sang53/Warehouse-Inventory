import { DisplayLocals } from "../../config/viewConfig.ts";

export default function (data: DisplayLocals) {
  const { title, tableData } = data;
  return {
    view: "display",
    viewData: {
      title,
      tableData,
    },
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
