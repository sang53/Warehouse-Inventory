export default function (tables, { searchBar = false, addBtn = false } = {}) {
    return {
        view: "display",
        viewData: { tables, searchBar, addBtn },
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
