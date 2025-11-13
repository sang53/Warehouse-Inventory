import { Router } from "express";
import { palletsGet, palletsIDGet } from "../controllers/palletsController.js";
const palletsRouter = Router();
palletsRouter.get("/id/:id", palletsIDGet);
palletsRouter.get("/", palletsGet);
export default palletsRouter;
