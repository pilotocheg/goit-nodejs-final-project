import * as testimonialServices from "../services/testimonialServices.js";

export const getTestimonials = async (req, res) => {
  const testimonials = await testimonialServices.listTestimonials();

  res.json(testimonials);
};
