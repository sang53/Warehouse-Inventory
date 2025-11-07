import { PoolClient } from "pg";
import Location from "../../models/locationsModel.js";

const HEIGHT = 9;
const WIDTH = 9;
const LOCATION_TYPES = ["intake", "storage", "outgoing"] as const;
const LOCATIONS_DATA = Array.from({ length: HEIGHT * WIDTH }, (_v, k) => {
  const row = Math.floor(k / WIDTH) + 1;
  const col = String.fromCharCode("A".charCodeAt(0) + (k % WIDTH));
  const l_role =
    Object.values(LOCATION_TYPES)[Math.floor(row / 3)] ?? LOCATION_TYPES[2];
  return { l_name: `${String(row)}-${col}`, l_role };
});

export default async function (client: PoolClient) {
  await Promise.all(
    LOCATIONS_DATA.map((locationData) => Location.create(locationData, client)),
  );
}
