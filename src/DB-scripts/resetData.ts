import { initData } from "./initData.ts";
import { resetTables } from "./utils/resetTables.ts";

await resetTables();
await initData();
