import { Router } from "express";
import {
  usersGet,
  usersIDGet,
  usersIDTasksGet,
  usersNewGet,
  usersNewPost,
} from "../controllers/usersController.ts";

const usersRouter = Router();

usersRouter.get("/:id/tasks", usersIDTasksGet);
usersRouter.post("/new", usersNewPost);
usersRouter.get("/new", usersNewGet);
usersRouter.get("/:id", usersIDGet);
usersRouter.get("/", usersGet);

export default usersRouter;
