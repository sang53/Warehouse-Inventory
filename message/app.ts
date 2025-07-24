import "dotenv/config";
import express from "express";
import path from "node:path";
import { messagesRouter } from "./routes/messagesRouter.ts";
import type { Response } from "express";
import { usersRouter } from "./routes/usersRouter.ts";

const app = express();

app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/messages", messagesRouter);
app.use("/users", usersRouter);
app.use("/", (_req, res: Response) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
console.log(`listening on port ${String(PORT)}!`);
app.listen(PORT);
