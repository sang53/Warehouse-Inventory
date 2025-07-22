import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { messagesRouter } from "./routes/messagesRouter.ts";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/messages", messagesRouter);

const PORT = process.env.PORT || 3000;
console.log(`listening on port ${String(PORT)}!`);
app.listen(PORT);
