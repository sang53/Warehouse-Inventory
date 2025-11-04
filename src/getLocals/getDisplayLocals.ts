export interface DisplayLocals {
  title: string;
  tableData: object[];
}

export interface DisplayOptions {
  searchBar?: boolean;
  addBtn?: boolean;
}

export default function (
  tables: DisplayLocals[],
  { searchBar = false, addBtn = false }: DisplayOptions = {},
) {
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
