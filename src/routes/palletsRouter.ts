import { Router } from "express";
import { palletsGet, palletsIDGet } from "../controllers/palletsController.ts";

const palletsRouter = Router();

palletsRouter.get("/:id", palletsIDGet);
palletsRouter.get("/", palletsGet);

export default palletsRouter;
