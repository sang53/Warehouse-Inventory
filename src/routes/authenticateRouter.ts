import { Router } from "express";
import {
  loginGet,
  loginPost,
  logoutGet,
} from "../controllers/authenticateController.ts";
import { ensureAuthenticated } from "../middlewares/authenticate.ts";

const authenticateRouter = Router();

authenticateRouter.get("/login", loginGet);
authenticateRouter.post("/login", loginPost);
authenticateRouter.get("/", ensureAuthenticated);
authenticateRouter.get("/logout", logoutGet);

export default authenticateRouter;
