import Ingredient from "../db/models/Ingredient.js";

const ingredientFields = ["id", "name", "description", "img"];

export const getAllIngredients = async () => {
  return Ingredient.findAll({
    attributes: ingredientFields,
    order: [["name", "ASC"]],
  });
};
