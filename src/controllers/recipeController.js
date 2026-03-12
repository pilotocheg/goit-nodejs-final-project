import * as recipeService from "../services/recipeServices.js";
import path from "path";
import fs from "fs/promises";
import HttpError from "../helpers/HttpError.js";

export const getOwnRecipes = async (req, res) => {
  const ownerId = req.user.id;
  const recipes = await recipeService.findByUserId(ownerId);
  res.json(recipes);
};

export const searchRecipes = async (req, res) => {
  const result = await recipeService.searchRecipes(req.query);
  res.json(result);
};

export const getPopularRecipes = async (req, res) => {
  const result = await recipeService.getPopularRecipes(req.query);
  res.json(result);
};

export const getRecipeDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeDetailInformation(id);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }
    res.json(recipe);
  } catch (error) {
    throw error;
  }
};

export const deleteRecipe = async(req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;
    const recipe = recipeService.deleteById(id, ownerId);
    return res.json(recipe);
}

export const createRecipe = async (req, res) => {
  let thumbPath = req.body.thumb;

  if (req.file) {
    const filename = req.file.filename;
    const timestamp = Date.now();
    const newFilename = `${timestamp}_${filename}`;
    const tempPath = path.join("temp", filename);
    const recipesDir = path.join("public", "recipes");
    const finalPath = path.join(recipesDir, newFilename);
    const relativeThumbPath = path.join("recipes", newFilename).replace(/\\/g, "/");

    try {
      await fs.rename(tempPath, finalPath);
      thumbPath = relativeThumbPath;
    } catch (error) {
      throw new HttpError(500, "Failed to save image");
    }
  }

  const recipeData = { ...req.body, thumb: thumbPath };
  const ownerId = req.user.id;
  const recipe = await recipeService.createRecipe(recipeData, ownerId);
  res.status(201).json({
    message: "Recipe created successfully",
    recipe,
  });
};



