import { Router } from "express";
import {
  deleteUserPost,
  newUserGet,
  newUserPost,
  updateUserGet,
  updateUserPost,
  userGet,
} from "../controllers/userController.ts";

export const usersRouter = Router();

usersRouter.post("/:id/delete", deleteUserPost);

usersRouter.get("/:id/update", updateUserGet);
usersRouter.post("/:id/update", updateUserPost);

usersRouter.get("/new", newUserGet);
usersRouter.post("/new", newUserPost);

usersRouter.get("/", userGet);
