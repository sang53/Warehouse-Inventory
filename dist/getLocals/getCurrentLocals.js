import { getProductInfo } from "../services/stock.js";
import extractKeys from "../utils/extractKeys.js";
import mapToView from "../utils/mapToView.js";
export default async function ({ user, task, products, l_name, o_id, }) {
    return {
        view: "current",
        viewData: {
            o_id,
            l_name,
            user,
            task: extractKeys(task, [
                "t_id",
                "t_type",
                "pa_id",
                "l_id",
                "placed",
                "started",
            ]),
            products: task.t_type === "pick"
                ? await getProductInfo(products)
                : { data: mapToView(products) },
        },
    };
}
