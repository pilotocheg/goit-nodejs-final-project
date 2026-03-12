import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import { generateUUID } from "../../helpers/uuidHelper.js";
import {
  emailValidationErrMessage,
  emailValidationPattern,
} from "../../constants/validation.js";

const User = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.STRING(24),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email in use",
      },
      validate: {
        is: {
          args: [emailValidationPattern],
          msg: emailValidationErrMessage,
        },
      },
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    avatarURL: DataTypes.STRING,
  },
  { timestamps: false },
);

User.beforeCreate((user) => {
  user.id = generateUUID();
});

export default User;
