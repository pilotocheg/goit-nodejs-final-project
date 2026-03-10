import express from "express";

import {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  updateUserAvatar,
} from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import { userCredentialsSchema } from "../schemas/authSchemas.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(userCredentialsSchema), registerUser);
authRouter.post("/login", validateBody(userCredentialsSchema), loginUser);

// routes with auth check
authRouter.use(authenticate);
authRouter.get("/current", getUser);
authRouter.post("/logout", logoutUser);
authRouter.patch("/avatars", upload.single("avatar"), updateUserAvatar);

export default authRouter;
