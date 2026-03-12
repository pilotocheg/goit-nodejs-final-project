import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Testimonial = sequelize.define(
  "testimonial",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    testimonial: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { timestamps: false },
);

export default Testimonial;
