import sequelize from "./sequelize.js";
import "./associations.js";

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export default connectDatabase;
