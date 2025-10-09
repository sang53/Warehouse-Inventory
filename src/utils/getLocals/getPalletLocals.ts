import { ProductPallet } from "../../models/palletsModel.ts";
import mapToView from "../mapToView.ts";

interface PalletLocals {
  pallet: ProductPallet;
  l_name: string | null;
}

export function getPalletLocals({ pallet, l_name }: PalletLocals) {
  // TODO: include location
  return {
    view: "pallet",
    viewData: {
      l_name,
      pa_id: pallet.pa_id,
      products: mapToView(pallet.products),
    },
  };
}
