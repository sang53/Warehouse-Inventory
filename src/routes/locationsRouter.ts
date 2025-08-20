import { Router } from "express";
import {
  locationsGet,
  locationsIDGet,
} from "../controllers/locationsController.ts";

const locationsRouter = Router();

locationsRouter.get("/:id", locationsIDGet);
locationsRouter.get("/", locationsGet);

export default locationsRouter;
