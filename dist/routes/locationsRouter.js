import { Router } from "express";
import { locationsGet, locationsIDGet, } from "../controllers/locationsController.js";
const locationsRouter = Router();
locationsRouter.get("/id/:id", locationsIDGet);
locationsRouter.get("/", locationsGet);
export default locationsRouter;
