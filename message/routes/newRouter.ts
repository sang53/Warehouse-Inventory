import type { Request, Response } from "express";
import { Router } from "express";
import { messages } from "../data/messages.ts";

export const newRouter = Router();

newRouter.get("/", (_req: Request, res: Response) => {
  res.render("form");
});

newRouter.post("/", (req: Request, res: Response) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    !("user" in req.body) ||
    !("text" in req.body)
  ) {
    res.status(400).send("Invalid request body");
    return;
  }

  const { user, text } = req.body as { user: unknown; text: unknown };
  if (
    typeof user !== "string" ||
    user.trim() === "" ||
    typeof text !== "string" ||
    text.trim() === ""
  ) {
    res.status(400).send("Invalid user or text");
    return;
  }

  messages.push({
    user,
    text,
    added: new Date(),
  });
  res.redirect("/");
});
