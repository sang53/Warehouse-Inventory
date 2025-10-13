interface DisplayLocals {
  title: string;
  tableData: object[];
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
