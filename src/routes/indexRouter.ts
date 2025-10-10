import { Router } from "express";
import { currentGet, indexGet } from "../controllers/indexController.ts";

const indexRouter = Router();

indexRouter.get("/current", currentGet);
indexRouter.get("/", indexGet);

export default indexRouter;
