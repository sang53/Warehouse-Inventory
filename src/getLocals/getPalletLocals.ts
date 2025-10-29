import { ProductPallet } from "../models/palletsModel.ts";
import mapToView from "../utils/mapToView.ts";

interface PalletLocals {
  pallet: ProductPallet;
  l_name: string | null;
}

export function getPalletLocals({ pallet, l_name }: PalletLocals) {
  return {
    view: "pallet",
    viewData: {
      l_name,
      pa_id: pallet.pa_id,
      created: pallet.created,
      products: mapToView(pallet.products),
    },
  };
}
