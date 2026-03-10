import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "express-async-errors";

import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
