import "dotenv/config";
import express from "express";
import path from "node:path";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import "./config/passport.ts";
import pool from "./config/pool.ts";
import indexRouter from "./routes/indexRouter.ts";
import productsRouter from "./routes/productsRouter.ts";
import ordersRouter from "./routes/ordersRouter.ts";
import locationsRouter from "./routes/locationsRouter.ts";
import palletsRouter from "./routes/palletsRouter.ts";
import tasksRouter from "./routes/tasksRouter.ts";
import usersRouter from "./routes/usersRouter.ts";
import authenticateRouter from "./routes/authenticateRouter.ts";
import { parseError, renderErrorPage } from "./middlewares/errors.ts";
import renderPage from "./middlewares/renderPage.ts";
import { ensureAuthenticated } from "./middlewares/authenticate.ts";

const app = express();

// view engine setup & body parser
app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// connect-pg-simple
const PgSession = connectPgSimple(session);

// set up express-session
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14,
    },
  }),
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// exposed routes
app.use("/", authenticateRouter);

// authenticate middleware
app.use(ensureAuthenticated);

// routes
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/pallets", palletsRouter);
app.use("/locations", locationsRouter);
app.use("/orders", ordersRouter);
app.use("/products", productsRouter);
app.use("/", indexRouter);

// render page middleware
app.use(renderPage);
app.use(parseError, renderErrorPage);

const PORT = process.env.PORT || 3000;
console.log(`listening on port ${String(PORT)}!`);
app.listen(PORT);
