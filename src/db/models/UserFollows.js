import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const UserFollows = sequelize.define(
  "user_follows",
  {
    followerId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    followingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
  },
  { timestamps: false },
);

//TODO Synced from db/connect.js after fixing FK types (associations overwrite them to match User.id).

export default UserFollows;