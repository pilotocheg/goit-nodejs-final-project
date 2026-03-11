import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Ingredient = sequelize.define("ingredient", {
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    autoIncrement: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  img: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default Ingredient;
