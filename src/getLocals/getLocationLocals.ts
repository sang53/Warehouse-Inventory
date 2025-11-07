import Location from "../models/locationsModel.js";

interface LocationLocals {
  location: Location;
  t_id: number | null;
}

export default function ({ location, t_id }: LocationLocals) {
  return {
    view: "location",
    viewData: {
      location,
      t_id: t_id ?? "None",
    },
  };
}
