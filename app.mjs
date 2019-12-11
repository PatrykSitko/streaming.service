import path from "path";
import cors from "cors";
import logger from "morgan";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import indexRouter from "./src/routes/index.mjs";
import manifestsRouter from "./src/routes/manifests.mjs";
import moviesRouter from "./src/routes/movies.mjs";
import seriesRouter from "./src/routes/series.mjs";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client/build")));

app.use("/", indexRouter);
app.use("/manifests", manifestsRouter);
app.use("/series", seriesRouter);
app.use("/movies", moviesRouter);

export default app;
