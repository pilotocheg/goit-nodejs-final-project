import User from "../db/models/User.js";
import UserFollows from "../db/models/UserFollows.js";
import Recipe from "../db/models/Recipe.js";
import sequelize from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";
import fs from "fs/promises";
import sharp from "sharp";
import { uploadImageToCloudinary } from "../helpers/imageUpload.js";

const subscriberFields = ["id", "name", "avatarURL"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const recipePreviewInclude = {
  model: Recipe,
  as: "recipes",
  attributes: ["thumb"],
  limit: 4,
};

const normalizePagination = (page, limit) => {
  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return { page: p, limit: l, offset: (p - 1) * l };
};

const mapFollowerToResponse = (follower, isFollowing) => ({
  id: follower.id,
  name: follower.name,
  avatarURL: follower.avatarURL,
  recipesCount: follower.getDataValue("recipesCount") || 0,
  recipeImageUrls: (follower.recipes || []).map((r) => r.thumb).slice(0, 4),
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
    attributes: [...subscriberFields, makeRecipesCountAttribute()],
    include: [recipePreviewInclude],
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

export const getFollowing = async (profileUserId, currentUserId, pagination = {}) => {
  const { page, limit, offset } = normalizePagination(pagination.page, pagination.limit);

  const profileExists = await User.findByPk(profileUserId, { attributes: ["id"] });
  if (!profileExists) throw new HttpError(404, "User not found");

  const { count, rows: followRows } = await UserFollows.findAndCountAll({
    where: { followerId: profileUserId },
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
    attributes: [...subscriberFields, makeRecipesCountAttribute()],
    include: [recipePreviewInclude],
  });
  const followingMap = new Map(following.map((f) => [f.id, f]));

  const followRowsCurrent = await UserFollows.findAll({
    where: { followerId: currentUserId, followingId: followingIds },
    attributes: ["followingId"],
  });
  const currentUserFollowingIds = new Set(followRowsCurrent.map((r) => r.followingId));

  const data = followingIds
    .map((id) => followingMap.get(id))
    .filter(Boolean)
    .map((u) => mapFollowerToResponse(u, currentUserFollowingIds.has(u.id)));

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
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  const removed = await UserFollows.destroy({
    where: { followerId: currentUserId, followingId: targetUserId },
  });
  if (removed === 0) throw new HttpError(404, "Not following this user");
};

export const updateUserAvatar = async (user, file) => {
  let avatarURL = null;

  if (file) {
    if (!file.path) {
      throw new HttpError(400, "Image file was not uploaded correctly");
    }

    if (!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME)) {
      throw new HttpError(500, "Cloudinary is not configured (set CLOUDINARY_URL or CLOUDINARY_* env vars)");
    }

    // Make a decent square avatar (256x256)
    const avatarTempPath = `${file.path}_avatar.jpg`;

    try {
      await sharp(file.path)
        .resize(256, 256, { fit: "cover" })
        .jpeg({ quality: 85 })
        .toFile(avatarTempPath);

      const uploadRes = await uploadImageToCloudinary(avatarTempPath, {
        folder: "foodies/avatars",
        publicId: user.id,
      });

      avatarURL = uploadRes.secure_url;
    } catch (error) {
      console.error("updateUserAvatar error:", error);
      throw new HttpError(500, "Failed to process image");
    } finally {
      // cleanup local temp files
      await fs.unlink(avatarTempPath).catch(() => {});
      await fs.unlink(file.path).catch(() => {});
    }
  }

  await user.update({ avatarURL });
  return avatarURL;
};

const userPublicAttributes = ["id", "name", "email", "avatarURL"];

const makeRecipesCountAttribute = () => [
  sequelize.literal(`(
  SELECT COUNT(*)::integer
  FROM recipes
  WHERE recipes."owner_id" = "user"."id"
)`),
  "recipesCount",
];

const makeFavoritesCountAttribute = () => [
  sequelize.literal(`(
  SELECT COUNT(*)::integer
  FROM user_favorites
  WHERE user_favorites."userId" = "user"."id"
)`),
  "favoritesCount",
];

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
    makeRecipesCountAttribute(),
    makeFollowsCountAttribute("followers"),
  ];

  const include = [
    {
      model: Recipe,
      as: "recipes",
      attributes: ["id", "title", "thumb", "preview", "time"],
    },
  ];

  if (isCurrentUser) {
    attributes.push(makeFavoritesCountAttribute());
    attributes.push(makeFollowsCountAttribute("following"));
    include.push({
      model: Recipe,
      as: "favoriteRecipes",
      attributes: ["id", "title", "thumb", "preview", "time"],
      through: { attributes: [] },
    });
  }

  const user = await User.findOne({
    where: { id: userId },
    attributes,
    include,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
};
