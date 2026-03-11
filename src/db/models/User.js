import crypto from "crypto";
import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import {
  emailValidationErrMessage,
  emailValidationPattern,
} from "../../constants/validation.js";

const generateShortId = () => crypto.randomBytes(12).toString("hex");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    defaultValue: generateShortId,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Unnamed User",
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
});

// uncomment to sync if the model above was updated
// User.sync({ alter: true });

export default User;
