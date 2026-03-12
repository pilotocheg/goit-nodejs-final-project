import express from "express";
import {
  getMySubscribers,
  getMyFollowing,
  followUserHandler,
  unfollowUserHandler,
  getFavoritesHandler,
  addToFavoritesHandler,
  removeFromFavoritesHandler,
  getCurrentUser,
  getUser,
  updateUserAvatarController,
} from "../controllers/usersController.js";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import { targetUserIdSchema } from "../schemas/usersSchemas.js";
import upload from "../middlewares/upload.js";

const usersRouter = express.Router();

// private routes
usersRouter.use(authenticate);
usersRouter.get("/following", getMyFollowing);
usersRouter.get("/:profileUserId/subscribers", getMySubscribers);

usersRouter.get("/favorites", getFavoritesHandler);
usersRouter.post("/favorites/:recipeId", addToFavoritesHandler);
usersRouter.delete("/favorites/:recipeId", removeFromFavoritesHandler);

usersRouter.patch("/follow", validateBody(targetUserIdSchema), followUserHandler);
usersRouter.delete("/:targetUserId/follow",unfollowUserHandler);
usersRouter.patch(
  "/follow",
  validateBody(targetUserIdSchema),
  followUserHandler,
);
usersRouter.delete("/:targetUserId/follow", unfollowUserHandler);
usersRouter.get("/current", getCurrentUser);
usersRouter.patch(
  "/avatar",
  upload.single("avatar"),
  updateUserAvatarController,
);
usersRouter.get("/:userId", getUser);

export default usersRouter;
