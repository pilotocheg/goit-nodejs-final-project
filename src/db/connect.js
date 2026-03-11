import { DataTypes } from "sequelize";
import sequelize from "./sequelize.js";
import "./associations.js";
import UserFollows from "./models/UserFollows.js";

async function connectDatabase() {
  try {
    await sequelize.authenticate();

    // Associations overwrite UserFollows FK types to match User.id (e.g. INTEGER).
    // Our DB has users.id as VARCHAR, so force STRING back before sync.
    UserFollows.rawAttributes.followerId.type = DataTypes.STRING;
    UserFollows.rawAttributes.followingId.type = DataTypes.STRING;

    await UserFollows.sync({ alter: true });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export default connectDatabase;
