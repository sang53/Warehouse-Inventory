import { Router } from "express";
import {
  productsGet,
  productsIDGet,
  productsNewGet,
  productsNewPost,
} from "../controllers/productsController.js";

const productsRouter = Router();

productsRouter.post("/new", productsNewPost);
productsRouter.get("/new", productsNewGet);
productsRouter.get("/id/:id", productsIDGet);
productsRouter.get("/", productsGet);

export default productsRouter;
