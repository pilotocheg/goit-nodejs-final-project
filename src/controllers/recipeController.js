import * as recipeService from "../services/recipeServices.js";
import HttpError from "../helpers/HttpError.js";

export const getOwnRecipes = async (req, res) => {
  const ownerId = req.user.id;
  const recipes = await recipeService.findByUserId(ownerId, req.query);
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
    const { id } = req.params;
    const recipe = await recipeService.getRecipeDetailInformation(id);
    if (!recipe) {
      throw new HttpError(404, "Recipe not found");
    }
    res.json(recipe);
};

export const deleteRecipe = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;
  
  const deleted = await recipeService.deleteById(id, ownerId);
  
  if (deleted === 0) {
    throw new HttpError(404, "Recipe not found or not authorized");
  }
  
  res.json({ message: "Recipe deleted successfully" });
};

export const createRecipe = async (req, res) => {
  const filePath = await recipeService.processThumb(req.file);
  const recipeData = { ...req.body, thumb: filePath };
  const ownerId = req.user.id;
  const recipe = await recipeService.createRecipe(recipeData, ownerId);
  res.status(201).json({
    message: "Recipe created successfully",
    recipe,
  });
};



