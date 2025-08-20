import { Router } from "express";
import {
  productsGet,
  productsIDGet,
  productsNewGet,
  productsNewPost,
} from "../controllers/productsController.ts";

const productsRouter = Router();

productsRouter.post("/new", productsNewPost);
productsRouter.get("/new", productsNewGet);
productsRouter.get("/:id", productsIDGet);
productsRouter.get("/", productsGet);

export default productsRouter;
