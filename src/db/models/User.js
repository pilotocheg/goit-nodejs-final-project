import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import {
  emailValidationErrMessage,
  emailValidationPattern,
} from "../../constants/validation.js";

// TODO: update user model

const User = sequelize.define("user", {
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
User.sync({ force: true });

export default User;
