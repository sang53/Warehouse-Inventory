import { createTables } from "./utils/createTables.ts";
import { dropTables } from "./utils/dropTables.ts";
import { dropTypes } from "./utils/dropTypes.ts";
import { createTypes } from "./utils/createTypes.ts";
import { initData } from "./initData.ts";

try {
  await dropTables();
} catch (err) {
  console.log("Previous tables not found");
  console.error(err);
}
try {
  await dropTypes();
} catch (err) {
  console.log("Previous types not found");
  console.error(err);
}
await createTypes();
await createTables();
await initData();
