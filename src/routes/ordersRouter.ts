import { Router } from "express";
import {
  ordersGet,
  ordersIDGet,
  ordersNewGet,
  ordersNewPost,
} from "../controllers/ordersController.ts";

const ordersRouter = Router();

ordersRouter.post("/new", ordersNewPost);
ordersRouter.get("/new", ordersNewGet);
ordersRouter.get("/id/:id", ordersIDGet);
ordersRouter.get("/", ordersGet);

export default ordersRouter;
