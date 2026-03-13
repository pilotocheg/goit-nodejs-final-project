import User from "../db/models/User.js";
import UserFollows from "../db/models/UserFollows.js";
import sequelize from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";
import fs from "fs/promises";
import path from "path";

const subscriberFields = ["id", "name", "avatarURL"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const normalizePagination = (page, limit) => {
  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return { page: p, limit: l, offset: (p - 1) * l };
};

const mapFollowerToResponse = (follower, isFollowing) => ({
  id: follower.id,
  name: follower.name,
  avatarURL: follower.avatarURL,
  recipesCount: 0, // TODO: replace with Recipe.count per user
  recipeImageUrls: [], // TODO: up to 4 recipe image URLs for this user
  isFollowing,
});

export const getSubscribers = async (profileUserId, currentUserId, pagination = {}) => {
  const { page, limit, offset } = normalizePagination(pagination.page, pagination.limit);

  const profileExists = await User.findByPk(profileUserId, { attributes: ["id"] });
  if (!profileExists) throw new HttpError(404, "User not found");

  const { count, rows: followRows } = await UserFollows.findAndCountAll({
    where: { followingId: profileUserId },
    attributes: ["followerId"],
    limit,
    offset,
  });

  const total = count;
  if (total === 0) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const followerIds = followRows.map((r) => r.followerId);
  const followers = await User.findAll({
    where: { id: followerIds },
    attributes: subscriberFields,
  });
  const followerMap = new Map(followers.map((f) => [f.id, f]));

  const followRowsCurrent = await UserFollows.findAll({
    where: { followerId: currentUserId, followingId: followerIds },
    attributes: ["followingId"],
  });
  const followingIds = new Set(followRowsCurrent.map((r) => r.followingId));

  const data = followerIds
    .map((id) => followerMap.get(id))
    .filter(Boolean)
    .map((follower) => mapFollowerToResponse(follower, followingIds.has(follower.id)));

  const totalPages = Math.ceil(total / limit);
  return { data, total, page, limit, totalPages };
};

export const getFollowing = async (currentUserId, pagination = {}) => {
  const { page, limit, offset } = normalizePagination(pagination.page, pagination.limit);

  const userExists = await User.findByPk(currentUserId, { attributes: ["id"] });
  if (!userExists) throw new HttpError(404, "User not found");

  const { count, rows: followRows } = await UserFollows.findAndCountAll({
    where: { followerId: currentUserId },
    attributes: ["followingId"],
    limit,
    offset,
  });

  const total = count;
  if (total === 0) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const followingIds = followRows.map((r) => r.followingId);
  const following = await User.findAll({
    where: { id: followingIds },
    attributes: subscriberFields,
  });
  const followingMap = new Map(following.map((f) => [f.id, f]));

  const data = followingIds
    .map((id) => followingMap.get(id))
    .filter(Boolean)
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatarURL: u.avatarURL,
      recipesCount: 0, // TODO: replace with Recipe.count per user
      recipeImageUrls: [], // TODO: up to 4 recipe image URLs for this user
      isFollowing: true,
    }));

  const totalPages = Math.ceil(total / limit);
  return { data, total, page, limit, totalPages };
};

export const followUser = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new HttpError(400, "Cannot follow yourself");
  }

  const target = await User.findByPk(targetUserId);
  if (!target) throw new HttpError(404, "User not found");

  const [_, created] = await UserFollows.findOrCreate({
    where: { followerId: currentUserId, followingId: targetUserId },
  });

  if (!created) throw new HttpError(409, "Already following this user");

  return getFollowing(currentUserId);
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  const removed = await UserFollows.destroy({
    where: { followerId: currentUserId, followingId: targetUserId },
  });
  if (removed === 0) throw new HttpError(404, "Not following this user");

  return getFollowing(currentUserId);
};

export const updateUserAvatar = async (user, file) => {
  let avatarURL = null;
  if (file) {
    const newPath = path.resolve("public", "avatars", file.filename);
    await fs.rename(file.path, newPath);
    avatarURL = path.join("avatars", file.filename);
  }

  await user.update({ avatarURL });

  return avatarURL;
};

const userPublicAttributes = ["name", "email", "avatarURL"];
const makeFollowsCountAttribute = (type) => [
  sequelize.literal(`(
  SELECT COUNT(*)::integer
  FROM user_follows
  WHERE user_follows."${type === "followers" ? "following" : "follower"}Id" = "user"."id"
)`),
  `${type}Count`,
];

export const getUserData = async (userId, isCurrentUser) => {
  const attributes = [
    ...userPublicAttributes,
    // TODO: add user created recipies count here
    makeFollowsCountAttribute("followers"),
  ];

  if (isCurrentUser) {
    // add current user fields here
    // TODO: add user favorite recipies count here
    attributes.push(makeFollowsCountAttribute("following"));
  }

  const user = await User.findOne({
    where: { id: userId },
    attributes,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
};
