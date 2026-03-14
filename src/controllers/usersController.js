import {
  getSubscribers,
  getFollowing,
  followUser,
  unfollowUser,
  updateUserAvatar,
  getUserData,
} from "../services/usersService.js";
import * as favoriteServices from "../services/favoriteServices.js";

export const getCurrentUser = async (req, res) => {
  const user = await getUserData(req.user.id, true);
  res.json(user);
};

export const getUser = async (req, res) => {
  const user = await getUserData(req.params.userId);
  res.json(user);
};

export const updateUserAvatarController = async (req, res) => {
  const { user, file } = req;
  const avatarURL = await updateUserAvatar(user, file);
  return res.json({ avatarURL });
};

export const getMySubscribers = async (req, res) => {
  const { profileUserId } = req.params;
  const { page, limit } = req.query;
  const result = await getSubscribers(profileUserId, req.user.id, { page, limit });
  res.json(result);
};

export const getMyFollowing = async (req, res) => {
  const { page, limit } = req.query;
  const result = await getFollowing(req.user.id, { page, limit });
  res.json(result);
};

export const followUserHandler = async (req, res) => {
  const { targetUserId } = req.body;
  await followUser(req.user.id, targetUserId);
  res.status(204).end();
};

export const unfollowUserHandler = async (req, res) => {
  const { targetUserId } = req.params;
  await unfollowUser(req.user.id, targetUserId);
  res.status(204).end();
};

export const getFavoritesHandler = async (req, res) => {
  const favorites = await favoriteServices.getFavorites(req.user.id);
  res.json(favorites);
};

export const addToFavoritesHandler = async (req, res) => {
  const { recipeId } = req.params;
  await favoriteServices.addToFavorites(req.user.id, recipeId);
  res.status(201).json({ message: "Added to favorites" });
};

export const removeFromFavoritesHandler = async (req, res) => {
  const { recipeId } = req.params;
  await favoriteServices.removeFromFavorites(req.user.id, recipeId);
  res.json({ message: "Removed from favorites" });
};
