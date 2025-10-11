import Location from "../models/locationsModel.ts";
import extractKeys from "../utils/extractKeys.ts";

interface LocationLocals {
  location: Location;
  t_id: number | null;
}

export default function ({ location, t_id }: LocationLocals) {
  return {
    view: "location",
    viewData: {
      location: extractKeys(location, ["l_id", "l_name", "l_role", "pa_id"]),
      t_id: t_id ?? "None",
    },
  };
}
