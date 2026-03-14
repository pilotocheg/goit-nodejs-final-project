import Joi from "joi";
import { string } from "./types.js";

export const addRecipeSchema = Joi.object({
  title: string().min(1).required().messages({
    "string.empty": "title is required",
    "string.min": "title must be at least 1 character long",
  }),
  category: string().required().messages({
    "string.empty": "category is required",
  }),
  area: string().required().messages({
    "string.empty": "area is required",
  }),
  instructions: string().min(10).required().messages({
    "string.empty": "instructions are required",
    "string.min": "instructions must be at least 10 characters long",
  }),
  description: string().min(10).required().messages({
    "string.empty": "description is required",
    "string.min": "description must be at least 10 characters long",
  }),
  time: Joi.number().integer().min(1).required().messages({
    "number.base": "time must be a number",
    "number.min": "time must be at least 1",
  }),
  preview: string().allow("").optional(),
  ingredients: Joi.string().custom((value, helpers) => {
    if (!value) return helpers.error('any.required');
    let arr;
    try {
      arr = JSON.parse(value);
    } catch {
      return helpers.error('string.json');
    }
    const itemSchema = Joi.object({
      ingredientId: string().required().messages({
        "string.empty": "ingredientId is required",
      }),
      measure: string().min(1).required().messages({
        "string.empty": "measure is required",
        "string.min": "measure must be at least 1 character long",
      }),
    });
    const result = Joi.array().items(itemSchema).min(1).validate(arr);
    if (result.error) return helpers.error('array.invalid');
    return arr;
  }).required().messages({
    "any.required": "ingredients array is required",
    "string.json": "ingredients must be valid JSON array",
    "array.invalid": "invalid ingredients array"
  }),
});
