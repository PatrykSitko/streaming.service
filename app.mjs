import path from "path";
import cors from "cors";
import logger from "morgan";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import indexRouter from "./routes/index.mjs";
import usersRouter from "./routes/users.mjs";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

export default app;
