import express from "express";

import {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  updateUserAvatar,
} from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), registerUser);
authRouter.post("/login", validateBody(loginSchema), loginUser);

// routes with auth check
authRouter.use(authenticate);
authRouter.get("/current", getUser);
authRouter.post("/logout", logoutUser);
authRouter.patch("/avatars", upload.single("avatar"), updateUserAvatar);

export default authRouter;
