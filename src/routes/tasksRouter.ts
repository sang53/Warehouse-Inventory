import { Router } from "express";
import {
  tasksGet,
  tasksIDGet,
  tasksIDPost,
} from "../controllers/tasksController.ts";

const tasksRouter = Router();

tasksRouter.post("/:id", tasksIDPost);
tasksRouter.get("/:id", tasksIDGet);
tasksRouter.get("/", tasksGet);

export default tasksRouter;
