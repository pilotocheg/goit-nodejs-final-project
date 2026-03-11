import Joi from "joi";

import { email, string } from "./types.js";

export const registerSchema = Joi.object({
  name: string().required(),
  email: email().required(),
  password: string().required().min(6).messages({
    "string.min": "Password must be at least 6 characters",
  }),
});

export const loginSchema = Joi.object({
  email: email().required(),
  password: string().required().min(6).messages({
    "string.min": "Password must be at least 6 characters",
  }),
});
