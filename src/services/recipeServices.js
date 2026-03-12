import Recipe from "../db/models/Recipe.js";
import User from "../db/models/User.js";
import Ingredient from "../db/models/Ingredient.js";
import RecipeIngredients from "../db/models/RecipeIngredients.js";
import sequelize from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";
import { Op } from "sequelize";
import UserFavorites from "../db/models/UserFavorites.js";

export const getRecipeDetailInformation = async (id) => {
  const recipe = await Recipe.findByPk(id, {
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "email", "avatarURL"],
      },
      {
        model: Ingredient,
        through: {
          model: RecipeIngredients,
          attributes: ["measure"],
        },
        attributes: ["id", "name", "img"],
      },
    ],
  });
  return recipe;
};

export const findByUserId = async (ownerId) => {
  if (!ownerId) throw new HttpError(400, "Owner ID required");

  const recipes = await Recipe.findAll({
    where: { owner_id: ownerId },
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "avatarURL"],
      },
      {
        model: Ingredient,
        through: {
          model: RecipeIngredients,
          attributes: ["measure"],
        },
        attributes: ["id", "name", "img"],
      },
    ],
  });

  return recipes;
};

export const createRecipe = async (body, ownerId) => {
  const transaction = await sequelize.transaction();
  try {
    const newRecipe = await Recipe.create(
      {
        title: body.title,
        category: body.category,
        area: body.area,
        instructions: body.instructions,
        description: body.description,
        thumb: body.thumb,
        preview: body.preview || "",
        time: body.time,
        owner_id: ownerId,
      },
      { transaction },
    );

    if (body.ingredients && Array.isArray(body.ingredients)) {
      const ingredientEntries = body.ingredients.map(
        ({ ingredientId, measure }) => ({
          recipe_id: newRecipe.id,
          ingredient_id: ingredientId,
          measure,
        }),
      );

      await RecipeIngredients.bulkCreate(ingredientEntries, { transaction });
    }

    await transaction.commit();

    return await getRecipeDetailInformation(newRecipe.id);
  } catch (error) {
    await transaction.rollback();
    throw new HttpError(400, error.message);
  }
};

export const deleteById = async (id, ownerId) => {
  const deleted = await Recipe.destroy({
    where: { id, owner_id: ownerId },
  });
  return deleted;
};

export const searchRecipes = async (query) => {
  const { category, area, ingredient, page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  const where = {};
  if (category) where.category = { [Op.iLike]: `%${category}%` };
  if (area) where.area = { [Op.iLike]: `%${area}%` };

const userInclude = {
    model: User,
    as: "owner",
    attributes: ["id", "name", "avatarURL"],
  };

  const ingredientsListInclude = {
    model: Ingredient,
    through: { model: RecipeIngredients, attributes: ["measure"] },
    attributes: ["id", "name"],
  };

  const include = [userInclude, ingredientsListInclude];

  if (ingredient) {
    const ingredientsFilterInclude = {
      model: Ingredient,
      where: { name: { [Op.iLike]: `%${ingredient}%` } },
      through: { attributes: [] },
      attributes: [],
      required: true,
    };
    include.push(ingredientsFilterInclude);
  }

  const { count, rows } = await Recipe.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  return {
    recipes: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    limit: parseInt(limit),
  };
};

export const getPopularRecipes = async () => {
  const topFavorites = await UserFavorites.findAll({
    attributes: [
      'recipeId',
      [sequelize.fn('COUNT', sequelize.col('recipeId')), 'count']
    ],
    group: ['recipeId'],
    order: [[sequelize.col('count'), 'DESC']],
    limit: 10,
    raw: true
  });

  const topRecipeIds = topFavorites.map(row => row.recipeId);

  const recipes = await Recipe.findAll({
    where: {
      id: {
        [Op.in]: topRecipeIds
      }
    },
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "avatarURL"],
      },
      {
        model: Ingredient,
        through: {
          model: RecipeIngredients,
          attributes: ["measure"],
        },
        attributes: ["id", "name", "img"],
      },
    ]
  });

  return {
    recipes,
    total: recipes.length,
  };
};
