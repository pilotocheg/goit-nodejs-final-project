import User from "./models/User.js";
import Category from "./models/Category.js";
import Area from "./models/Area.js";
import UserFollows from "./models/UserFollows.js";
import Recipe from "./models/Recipe.js";
import Testimonial from "./models/Testimonial.js";
import RecipeIngredients from "./models/RecipeIngredients.js";
import Ingredient from "./models/Ingredient.js";
import UserFavorites from "./models/UserFavorites.js";


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

// Recipe owner_id to User id (Many to One)
User.hasMany(Recipe, { foreignKey: "owner_id", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });


// Recipe to Ingredients (Many to Many)
Recipe.belongsToMany(Ingredient, {
  through: RecipeIngredients,
  foreignKey: 'recipe_id',
});

Ingredient.belongsToMany(Recipe, {
  through: RecipeIngredients,
  foreignKey: 'ingredient_id',
});



// User-Recipe favorites (many-to-many)
User.belongsToMany(Recipe, {
  through: UserFavorites,
  as: "favoriteRecipes",
  foreignKey: "userId",
});
Recipe.belongsToMany(User, {
  through: UserFavorites,
  as: "favoritedBy",
  foreignKey: "recipeId",
});
Testimonial.belongsTo(User, { as: "owner", foreignKey: "owner_id" });

// TODO (Recipe): when Recipe model exists uncomment the relation
// User.hasMany(Recipe, { foreignKey: "userId" });
// Then you can use user.getRecipes(), count, and preview image URLs for followers list.
