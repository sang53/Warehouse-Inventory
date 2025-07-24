import type { Request, Response } from "express";
import { messages } from "../data/messages.ts";

export function newMessagePost(req: Request, res: Response) {
  messages.push({
    user,
    text,
    added: new Date(),
  });
  res.redirect("/messages");
}

export function messageGet(_req: Request, res: Response) {
  res.render("messages", { messages });
}

export function newMessageGet(_req: Request, res: Response) {
  res.render("form");
}
