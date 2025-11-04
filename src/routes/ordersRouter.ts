import { Router } from "express";
import {
  ordersCompleteGet,
  ordersGet,
  ordersIDGet,
  ordersIncompleteGet,
  ordersNewGet,
  ordersNewPost,
} from "../controllers/ordersController.ts";

const ordersRouter = Router();

ordersRouter.get("/incomplete", ordersIncompleteGet);
ordersRouter.get("/complete", ordersCompleteGet);
ordersRouter.post("/new", ordersNewPost);
ordersRouter.get("/new", ordersNewGet);
ordersRouter.get("/id/:id", ordersIDGet);
ordersRouter.get("/", ordersGet);

export default ordersRouter;
