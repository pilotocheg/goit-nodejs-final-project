import { getAllIngredients } from "../services/ingredientsService.js";

export const getIngredients = async (_req, res) => {
  const ingredients = await getAllIngredients();
  res.json(ingredients);
};
