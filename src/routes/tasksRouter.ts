import { Router } from "express";
import {
  taskCompleteGet,
  taskIncompleteGet,
  tasksGet,
  tasksIDGet,
  tasksIDPost,
} from "../controllers/tasksController.ts";

const tasksRouter = Router();

tasksRouter.get("/incomplete", taskIncompleteGet);
tasksRouter.get("/complete", taskCompleteGet);
tasksRouter.post("/id/:id", tasksIDPost);
tasksRouter.get("/id/:id", tasksIDGet);
tasksRouter.get("/", tasksGet);

export default tasksRouter;
