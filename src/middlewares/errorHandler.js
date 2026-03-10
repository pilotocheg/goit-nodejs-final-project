import { ValidationError, UniqueConstraintError } from "sequelize";

const errorHandler = (err, req, res, next) => {
  if (err instanceof UniqueConstraintError) {
    err.status = 409;
  } else if (err instanceof ValidationError) {
    err.status = 400;
  }

  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
};

export default errorHandler;
