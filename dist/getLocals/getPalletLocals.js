import mapToView from "../utils/mapToView.js";
export function getPalletLocals({ pallet, location }) {
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
