import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const UserFavorites = sequelize.define(
  "user_favorites",
  {
    userId: {
      type: DataTypes.STRING(24),
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    recipeId: {
      type: DataTypes.STRING(24),
      allowNull: false,
      references: { model: "recipes", key: "id" },
      onDelete: "CASCADE",
    },
  },
  { timestamps: false, indexes: [{ unique: true, fields: ['userId', 'recipeId'] }] }
);

export default UserFavorites;
