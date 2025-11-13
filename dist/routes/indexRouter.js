import { Router } from "express";
import { currentGet, indexGet } from "../controllers/indexController.js";
const indexRouter = Router();
indexRouter.get("/current", currentGet);
indexRouter.get("/", indexGet);
export default indexRouter;
