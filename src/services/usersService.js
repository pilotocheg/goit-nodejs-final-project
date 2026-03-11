import User from "../db/models/User.js";
import UserFollows from "../db/models/UserFollows.js";
import HttpError from "../helpers/HttpError.js";

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
    recipeImageUrls: [],  // TODO: up to 4 recipe image URLs for this user
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
