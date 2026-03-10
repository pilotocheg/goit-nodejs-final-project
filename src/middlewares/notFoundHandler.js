import HttpError from "../helpers/HttpError.js";

const notFoundHandler = () => {
  throw new HttpError(404, "Route not found");
};

export default notFoundHandler;
