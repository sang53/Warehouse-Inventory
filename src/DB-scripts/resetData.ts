import initLocations from "./utils/initLocations.ts";
import initUsers from "./utils/initUsers.ts";
import insertProducts from "./utils/insertProducts.ts";
import { resetTables } from "./utils/resetTables.ts";

await resetTables();
await Promise.all([initUsers(), initLocations(), insertProducts()]);
