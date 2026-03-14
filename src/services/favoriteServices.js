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

export const getFavorites = async (userId, page = 1, limit = 10) => {
  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: favoriteRecipes, count: total } = await Recipe.findAndCountAll({
    limit: parsedLimit,
    offset: offset,
    distinct: true,
    include: [
      {
        model: User,
        as: "favoritedBy",
        where: { id: userId },
        attributes: [],
      },
      { 
        model: User, 
        as: "owner", 
        attributes: ["name", "avatarURL"] 
      },
      {
        model: Ingredient,
        through: { attributes: ["measure"] },
        attributes: ["id", "name"],
      },
    ],
  });

  return {
    favoriteRecipes,
    total,
    totalPages: Math.ceil(total / parsedLimit),
    currentPage: parsedPage,
    limit: parsedLimit,
  };
};
