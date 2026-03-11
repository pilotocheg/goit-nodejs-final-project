import User from "./models/User.js";
import UserFollows from "./models/UserFollows.js";

User.belongsToMany(User, {
  through: UserFollows,
  as: "followers",
  foreignKey: "followingId",
  otherKey: "followerId",
});
User.belongsToMany(User, {
  through: UserFollows,
  as: "following",
  foreignKey: "followerId",
  otherKey: "followingId",
});
