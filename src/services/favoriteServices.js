import UserFavorites from "../db/models/UserFavorites.js";
import Recipe from "../db/models/Recipe.js";
import User from "../db/models/User.js";
import Ingredient from "../db/models/Ingredient.js";
import RecipeIngredients from "../db/models/RecipeIngredients.js";
import HttpError from "../helpers/HttpError.js";

export const addToFavorites = async (userId, recipeId) => {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  const [favorite, created] = await UserFavorites.findOrCreate({
    where: { userId, recipeId },
  });
  if (!created) {
    throw new HttpError(400, "Recipe already in favorites");
  }
  return favorite;
};

export const removeFromFavorites = async (userId, recipeId) => {
  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  const deleted = await UserFavorites.destroy({
    where: { userId, recipeId },
  });
  if (!deleted) {
    throw new HttpError(404, "Recipe not in favorites");
  }
};

export const getFavorites = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: [],
    include: [
      {
        association: "favoriteRecipes",
        include: [
          { model: User, as: "owner", attributes: ["name", "avatarURL"] },
          {
            model: Ingredient,
            through: { model: RecipeIngredients, attributes: ["measure"] },
            attributes: ["id", "name"],
          },
        ],
      },
    ],
  });
  return user.favoriteRecipes || [];
};
