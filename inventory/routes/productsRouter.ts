import { Router } from "express";
import {
  productsGet,
  productsIdGet,
  productsNewGet,
  productsNewPost,
} from "../controllers/productsController.ts";

export const productsRouter = Router();

productsRouter.post("/new", productsNewPost);
productsRouter.get("/new", productsNewGet);
productsRouter.get("/:id", productsIdGet);
productsRouter.get("/", productsGet);
