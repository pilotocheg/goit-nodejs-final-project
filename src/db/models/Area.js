import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Area = sequelize.define(
  "area",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false },
);

// Area.sync();

export default Area;
