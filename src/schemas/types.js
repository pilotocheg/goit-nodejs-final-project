import Joi from "joi";
import {
  emailValidationErrMessage,
  emailValidationPattern,
} from "../constants/validation.js";

export const string = () => Joi.string();
export const email = () =>
  string().regex(emailValidationPattern).messages({
    "string.pattern.base": emailValidationErrMessage,
  });
