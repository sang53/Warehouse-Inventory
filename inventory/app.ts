import "dotenv/config";
import express from "express";
import path from "node:path";
import { indexRouter } from "./routes/indexRouter.ts";
import { productsRouter } from "./routes/productsRouter.ts";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/products", productsRouter);
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;
console.log(`listening on port ${String(PORT)}!`);
app.listen(PORT);
