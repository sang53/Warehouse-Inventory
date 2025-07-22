import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { indexRouter } from "./routes/indexRouter.ts";
import { newRouter } from "./routes/newRouter.ts";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/new", newRouter);

const PORT = process.env.PORT || 3000;
console.log(`listening on port ${String(PORT)}!`);
app.listen(PORT);
