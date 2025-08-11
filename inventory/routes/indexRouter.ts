import { Router } from "express";
import { indexGet, indexPostReset } from "../controllers/indexController.ts";

export const indexRouter = Router();

indexRouter.get("/", indexGet);

indexRouter.post("/", indexPostReset);
