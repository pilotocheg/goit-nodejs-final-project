import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export const createToken = (payload, expiresIn = "24h") =>
  jwt.sign(payload, JWT_SECRET, { expiresIn });

export const verifyToken = (token) => {
  try {
    const data = jwt.verify(token, JWT_SECRET);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
