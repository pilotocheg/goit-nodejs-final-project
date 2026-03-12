import User from "./models/User.js";
import Category from "./models/Category.js";
import Area from "./models/Area.js";
import UserFollows from "./models/UserFollows.js";
import Testimonial from "./models/Testimonial.js";

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

Testimonial.belongsTo(User, { as: "owner", foreignKey: "owner_id" });

// TODO (Recipe): when Recipe model exists uncomment the relation
// User.hasMany(Recipe, { foreignKey: "userId" });
// Then you can use user.getRecipes(), count, and preview image URLs for followers list.
