import { initData } from "./initData.ts";
import { createTables } from "./utils/createTables.ts";
import { createTypes } from "./utils/createTypes.ts";

await createTypes();
await createTables();
await initData();
