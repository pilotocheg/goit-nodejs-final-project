import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import authenticate from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), registerUser);
authRouter.post("/login", validateBody(loginSchema), loginUser);

// private routes
authRouter.use(authenticate);
authRouter.post("/logout", logoutUser);

export default authRouter;
