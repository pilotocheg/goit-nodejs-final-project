import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import { generateUUID } from "../../helpers/uuidHelper.js";

const Recipe = sequelize.define(
  "recipe",
  {
    id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      autoIncrement: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumb: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    preview: {
      type: DataTypes.TEXT,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
  },

{ timestamps: false },
);

Recipe.beforeCreate((recipe) => {
  recipe.id = generateUUID();
});

export default Recipe;
