import { Router } from "express";
import { indexGet } from "../controllers/indexController.ts";

const indexRouter = Router();

indexRouter.get("/", indexGet);

export default indexRouter;
