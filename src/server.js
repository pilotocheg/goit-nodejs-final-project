import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "express-async-errors";

import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import authRouter from "./routes/authRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import areaRouter from "./routes/areaRouter.js";
import usersRouter from "./routes/usersRouter.js";
import testimonialRouter from "./routes/testimonialRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/areas", areaRouter);
app.use("/api/users", usersRouter);
app.use("/api/testimonials", testimonialRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
