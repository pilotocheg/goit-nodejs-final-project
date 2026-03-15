import { Sequelize } from "sequelize";
import isTruthy from "../helpers/isTruthy.js";

const nodeEnv = (process.env.NODE_ENV || "development").trim().toLowerCase();
const defaultSslEnabled = nodeEnv === "production";
const sslEnabled =
  process.env.DB_SSL === undefined
    ? defaultSslEnabled
    : isTruthy(process.env.DB_SSL);

const rejectUnauthorized =
  process.env.DB_SSL_REJECT_UNAUTHORIZED === undefined
    ? true
    : isTruthy(process.env.DB_SSL_REJECT_UNAUTHORIZED);

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ...(sslEnabled
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized,
          },
        },
      }
    : {}),
});

export default sequelize;
