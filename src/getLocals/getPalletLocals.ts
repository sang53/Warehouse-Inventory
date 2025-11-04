import Location from "../models/locationsModel.ts";
import { ProductPallet } from "../models/palletsModel.ts";
import mapToView from "../utils/mapToView.ts";

interface PalletLocals {
  pallet: ProductPallet;
  location: Location | null;
}

export function getPalletLocals({ pallet, location }: PalletLocals) {
  return {
    view: "pallet",
    viewData: {
      location: location ?? { l_id: null, l_name: null },
      pa_id: pallet.pa_id,
      created: pallet.created,
      products: mapToView(pallet.products),
    },
  };
}
