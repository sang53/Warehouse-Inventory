import { messages } from "../data/messages.ts";
import { Router } from "express";
import type { Request, Response } from "express";

export const indexRouter = Router();

indexRouter.get("/", (_req: Request, res: Response) => {
  res.render("index", { messages });
});
