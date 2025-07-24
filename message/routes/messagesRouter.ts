import { Router } from "express";
import {
  messageGet,
  newMessageGet,
  newMessagePost,
} from "../controllers/messageController.ts";

export const messagesRouter = Router();

messagesRouter.get("/new", newMessageGet);

messagesRouter.post("/new", newMessagePost);

messagesRouter.get("/", messageGet);
