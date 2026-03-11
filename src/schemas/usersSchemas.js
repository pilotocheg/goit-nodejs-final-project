import Joi from "joi";

export const targetUserIdSchema = Joi.object({
  targetUserId: Joi.string().required().messages({
    "string.empty": "targetUserId is required",
  }),
});
