import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";
import "./associations.js";
import UserFollows from "./models/UserFollows.js";
import User from "./models/User.js"
import Recipe from "./models/Recipe.js";
import Area from "./models/Area.js";
import Ingredient from "./models/Ingredient.js";
import Category from "./models/Category.js";
import Testimonial from "./models/Testimonial.js";
import RecipeIngredients from "./models/RecipeIngredients.js";
import UserFavorites from "./models/UserFavorites.js";

async function connectDatabase() {
  try {
  
    await sequelize.authenticate();
    // Create tables for localhost
    // await User.sync({ alter: true });
    // await Recipe.sync({ alter: true });
    // await Ingredient.sync({force: true});
    // await RecipeIngredients.sync({force: true})
    // await Area.sync({ force: true });
    // await Category.sync({force: true});
    // await Testimonial.sync({force: true});
    // await UserFollows.sync({ force: true });
    // await UserFavorites.sync({force:true});


    // Associations overwrite UserFollows FK types to match User.id (e.g. INTEGER).
    // Our DB has users.id as VARCHAR, so force STRING back before sync.
    // Note: uncomment when you need to sync it again
    // UserFollows.rawAttributes.followerId.type = DataTypes.STRING;
    // UserFollows.rawAttributes.followingId.type = DataTypes.STRING;

    // await UserFollows.sync({ forse: true });
    // await sequelize.sync({force: true})
    console.log("Database connection successful");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export default connectDatabase;
