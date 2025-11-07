import { createTables } from "./utils/createTables.js";
import { dropTables } from "./utils/dropTables.js";
import { dropTypes } from "./utils/dropTypes.js";
import { createTypes } from "./utils/createTypes.js";
import { initData } from "./initData.js";

try {
  await dropTables();
} catch (err) {
  console.error("Previous tables not found");
  console.error(err);
}
try {
  await dropTypes();
} catch (err) {
  console.error("Previous types not found");
  console.error(err);
}
await createTypes();
await createTables();
await initData();
