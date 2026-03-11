import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Ingredient = sequelize.define("ingredient", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Uncomment to create/update table: Ingredient.sync({ alter: true });

export default Ingredient;
