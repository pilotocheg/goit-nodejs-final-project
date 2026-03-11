import Testimonial from "../db/models/Testimonial.js";
import User from "../db/models/User.js";

export const listTestimonials = () =>
  Testimonial.findAll({
    attributes: ["id", "testimonial"],
    include: {
      model: User,
      as: "owner",
      attributes: ["id", "name", "avatarURL"],
    },
  });
