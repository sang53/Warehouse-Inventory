import { Router } from "express";
import {
  usersGet,
  usersIDGet,
  usersNewGet,
  usersNewPost,
} from "../controllers/usersController.ts";

const usersRouter = Router();

usersRouter.post("/new", usersNewPost);
usersRouter.get("/new", usersNewGet);
usersRouter.get("/id/:id", usersIDGet);
usersRouter.get("/", usersGet);

export default usersRouter;
