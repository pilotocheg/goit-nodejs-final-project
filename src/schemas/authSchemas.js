import Joi from "joi";

import { email, string } from "./types.js";

export const userCredentialsSchema = Joi.object({
  email: email().required(),
  password: string().required().min(6).messages({
    "string.min": "Password must be at least 6 characters",
  }),
});
