import { ProductOrder } from "../models/ordersModel.ts";
import extractKeys from "../utils/extractKeys.ts";
import mapToView from "../utils/mapToView.ts";

interface OrderLocals {
  order: ProductOrder;
}

export default function ({ order }: OrderLocals) {
  return {
    view: "order",
    viewData: {
      order: extractKeys(order, [
        "o_id",
        "o_type",
        "t_id",
        "placed",
        "completed",
      ]),
      products: mapToView(order.products),
    },
  };
}
