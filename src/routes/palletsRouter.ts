import { Router } from "express";
import {
  palletsGet,
  palletsIDEditGet,
  palletsIDEditPost,
  palletsIDGet,
  palletsPost,
} from "../controllers/palletsController.ts";

const palletsRouter = Router();

palletsRouter.post("/:id/edit", palletsIDEditPost);
palletsRouter.get("/:id/edit", palletsIDEditGet);
palletsRouter.get("/:id", palletsIDGet);
palletsRouter.post("/", palletsPost);
palletsRouter.get("/", palletsGet);

export default palletsRouter;
