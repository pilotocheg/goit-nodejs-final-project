import Recipe from "../db/models/Recipe.js";
import User from "../db/models/User.js";
import Ingredient from "../db/models/Ingredient.js";
import RecipeIngredients from "../db/models/RecipeIngredients.js";
import sequelize from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";
import { Op } from "sequelize";
import UserFavorites from "../db/models/UserFavorites.js";
import path from 'path';
import fs from 'fs/promises';
import sharp from "sharp";
import {
  uploadImageToCloudinary,
} from "../helpers/imageUpload.js";

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

export const findByUserId = async (ownerId, query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: recipes } = await Recipe.findAndCountAll({
    where: { owner_id: ownerId },
    attributes: ['id', 'title', 'description', 'thumb'],
    limit,
    offset,
    distinct: true,
  });
  
  console.log(page);
  const totalPages = Math.ceil(count / limit);

  if (count > 0 && page > totalPages) {
    throw new HttpError(404, "Page not found");
  }

  return {
    recipes,
    total: count,
    totalPages,
    currentPage: page,
    limit: limit,
  };
};

export const processThumb = async (file) => {
  if (!file) return null;

  // multer should provide file.path; if not, fail early with clear message
  if (!file.path) {
    throw new HttpError(400, "Image file was not uploaded correctly");
  }

  const baseName = path.parse(file.filename).name;
  const tempThumbPath = path.join("temp", `${baseName}_thumb.jpg`);
  const tempPreviewPath = path.join("temp", `${baseName}_preview.jpg`);

  try {
    await sharp(file.path)
      .resize(343, 240, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toFile(tempThumbPath);

    await sharp(file.path)
      .resize(615, 462, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toFile(tempPreviewPath);

    const useCloud = !!(process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME);
    if (!useCloud) {
      throw new HttpError(500, "Cloudinary is not configured (set CLOUDINARY_URL or CLOUDINARY_* env vars)");
    }

    const [thumbRes, previewRes] = await Promise.all([
      uploadImageToCloudinary(tempThumbPath, {
        folder: "foodies/recipes/thumb",
      }),
      uploadImageToCloudinary(tempPreviewPath, {
        folder: "foodies/recipes/preview",
      }),
    ]);

    // cleanup local temp files
    await fs.unlink(tempThumbPath).catch(() => {});
    await fs.unlink(tempPreviewPath).catch(() => {});
    await fs.unlink(file.path).catch(() => {});

    return { thumbURL: thumbRes.secure_url, previewURL: previewRes.secure_url };
  } catch (error) {
    // keep the root cause in server logs
    console.error("processThumb error:", error);

    // cleanup
    await fs.unlink(tempThumbPath).catch(() => {});
    await fs.unlink(tempPreviewPath).catch(() => {});
    await fs.unlink(file.path).catch(() => {});

    throw new HttpError(500, "Failed to process image");
  }
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

  const include = [
    {
      model: User,
      as: "owner",
      attributes: ["id", "name", "avatarURL"],
    },
  ];

  if (ingredient) {
    include.push({
      model: Ingredient,
      where: { name: { [Op.iLike]: `%${ingredient}%` } },
      through: { attributes: [] },
      attributes: [],
      required: true,
    });
  }

  const { count, rows } = await Recipe.findAndCountAll({
    where,
    include,
    distinct: true,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  if (rows.length === 0 && offset > 0) {
    throw new HttpError(404, "Page not found");
  }

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
    limit: 4,
    raw: true
  });

  const topRecipeIds = topFavorites.map((row) => row.recipeId);

  const recipes = await Recipe.findAll({
    where: {
      id: {
        [Op.in]: topRecipeIds,
      },
    },
    attributes: ['id', 'title', 'description', 'thumb'],
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["id", "name", "avatarURL"],
      },
    ],
  });

  return {
    recipes,
    total: recipes.length,
  };
};
