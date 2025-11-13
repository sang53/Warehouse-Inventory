import "dotenv/config";
import express from "express";
import path from "node:path";
import session from "express-session";
import passport from "passport";
import connectPgSimple from "connect-pg-simple";
import "./config/passport.js";
import pool from "./config/pool.js";
import indexRouter from "./routes/indexRouter.js";
import productsRouter from "./routes/productsRouter.js";
import ordersRouter from "./routes/ordersRouter.js";
import locationsRouter from "./routes/locationsRouter.js";
import palletsRouter from "./routes/palletsRouter.js";
import tasksRouter from "./routes/tasksRouter.js";
import usersRouter from "./routes/usersRouter.js";
import authenticateRouter from "./routes/authenticateRouter.js";
import { parseError, renderErrorPage } from "./middlewares/errors.js";
import renderPage from "./middlewares/renderPage.js";
import { ensureAuthenticated } from "./middlewares/authenticate.js";
const app = express();
// set up public directory
app.use(express.static("public"));
// view engine setup
app.set("views", path.join(import.meta.dirname, "views"));
app.set("view engine", "ejs");
// POST body parser
app.use(express.urlencoded({ extended: true }));
// connect-pg-simple
const PgSession = connectPgSimple(session);
// set up express-session
app.use(session({
    store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 14,
    },
}));
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
