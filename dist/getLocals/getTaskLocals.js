import getDisplayLocals from "./getDisplayLocals.js";
export default function (tableData, t_id, options) {
    const { viewData } = getDisplayLocals(tableData, options);
    return { view: "task", viewData: { ...viewData, t_id } };
}
