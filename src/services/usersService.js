import User from "../db/models/User.js";
import UserFollows from "../db/models/UserFollows.js";
import sequelize from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";
import fs from "fs/promises";
import path from "path";

const subscriberFields = ["id", "name", "avatarURL"];

export const getSubscribers = async (profileUserId, currentUserId) => {
  const user = await User.findByPk(profileUserId, {
    attributes: [],
    include: [
      {
        association: "followers",
        attributes: subscriberFields,
        through: { attributes: [] },
      },
    ],
  });

  if (!user) throw new HttpError(404, "User not found");

  if (!user.followers?.length) return [];

  const followerIds = user.followers.map((f) => f.id);

  const followRows = await UserFollows.findAll({
    where: { followerId: currentUserId, followingId: followerIds },
    attributes: ["followingId"],
  });
  const followingIds = new Set(followRows.map((r) => r.followingId));

  // TODO (Recipe): get recipes count and preview image URLs per follower
  // e.g. Recipe.count({ where: { userId: followerId } }), Recipe.findAll({ where: { userId }, limit: 4, attributes: ['imageURL'] })
  return user.followers.map((follower) => ({
    id: follower.id,
    name: follower.name,
    avatarURL: follower.avatarURL,
    recipesCount: 0, // TODO: replace with Recipe.count per user
    recipeImageUrls: [], // TODO: up to 4 recipe image URLs for this user
    isFollowing: followingIds.has(follower.id),
  }));
};

export const getFollowing = async (currentUserId) => {
  const user = await User.findByPk(currentUserId, {
    attributes: [],
    include: [
      {
        association: "following",
        attributes: subscriberFields,
        through: { attributes: [] },
      },
    ],
  });

  if (!user) throw new HttpError(404, "User not found");

  if (!user.following?.length) return [];

  return user.following.map((u) => ({
    id: u.id,
    name: u.name,
    avatarURL: u.avatarURL,
    recipesCount: 0, // TODO: replace with Recipe.count per user
    recipeImageUrls: [], // TODO: up to 4 recipe image URLs for this user
    isFollowing: true,
  }));
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
    return new HttpError(404, "User not found");
  }

  return user;
};
