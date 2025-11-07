import getDisplayLocals, {
  DisplayLocals,
  DisplayOptions,
} from "./getDisplayLocals.js";

export default function (
  tableData: DisplayLocals[],
  t_id: number,
  options?: DisplayOptions,
) {
  const { viewData } = getDisplayLocals(tableData, options);
  return { view: "task", viewData: { ...viewData, t_id } };
}
