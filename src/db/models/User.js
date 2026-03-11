import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import {
  emailValidationErrMessage,
  emailValidationPattern,
} from "../../constants/validation.js";

// TODO: update user model

const User = sequelize.define("user", {
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
});

// TODO (Recipe): when Recipe model exists, add in db/associations.js:
//   User.hasMany(Recipe, { foreignKey: "userId" });
// Then you can use user.getRecipes(), count, and preview image URLs for followers list.

// uncomment to sync if the model above was updated
User.sync({ alter: true });

export default User;
