import HttpError from "../helpers/HttpError.js";
import { verifyToken } from "../helpers/jwtToken.js";
import { findUser } from "../services/authServices.js";

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new HttpError(401, "No authorization header");
  }

  const [prefix, token] = authorization.split(" ");

  if (prefix !== "Bearer") {
    throw new HttpError(401, "No Bearer prefix");
  }

  const { data, error } = verifyToken(token);

  if (error) {
    throw new HttpError(401, `Invalid token: ${error.message}`);
  }

  const user = await findUser({ id: data.id, token });

  if (!user) {
    throw new HttpError(401, "Not authorized");
  }

  // save user to the request object
  req.user = user;

  next();
};

export default authenticate;
