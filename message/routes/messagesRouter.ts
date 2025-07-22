import { messages } from "../data/messages.ts";
import { Router } from "express";
import type { Request, Response } from "express";

export const messagesRouter = Router();

messagesRouter.get("/", (_req: Request, res: Response) => {
  res.render("messages", { messages });
});

messagesRouter.get("/new", (_req: Request, res: Response) => {
  res.render("form");
});

messagesRouter.post("/new", (req: Request, res: Response) => {
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
  res.redirect("/messages");
});
