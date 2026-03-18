import sequelize from "./sequelize.js";
import "./associations.js";
import isTruthy from "../helpers/isTruthy.js";

async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");

    // Dev-only: auto-create/update tables from Sequelize models.
    // This is strictly opt-in and only runs when DB_SYNC is explicitly provided.
    // In production you normally DO NOT set DB_SYNC/DB_SYNC_ALTER/DB_SYNC_FORCE.
    if (process.env.DB_SYNC !== undefined && isTruthy(process.env.DB_SYNC)) {
      const syncOptions = {
        alter: process.env.DB_SYNC_ALTER !== undefined && isTruthy(process.env.DB_SYNC_ALTER),
        force: process.env.DB_SYNC_FORCE !== undefined && isTruthy(process.env.DB_SYNC_FORCE),
      };

      await sequelize.sync(syncOptions);
      console.log("Database schema synced", syncOptions);
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

export default connectDatabase;
