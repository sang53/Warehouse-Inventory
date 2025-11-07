import { initData } from "./initData.js";
import { createTables } from "./utils/createTables.js";
import { createTypes } from "./utils/createTypes.js";

await createTypes();
await createTables();
await initData();
