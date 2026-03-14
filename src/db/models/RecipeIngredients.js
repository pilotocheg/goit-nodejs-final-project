import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const RecipeIngredients = sequelize.define(
  "recipe_ingredients",
  {
    recipe_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    ingredient_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    measure: {
      type: DataTypes.STRING(100),
      allowNull: null,
    },
  },
  { timestamps: false },
);

export default RecipeIngredients;
