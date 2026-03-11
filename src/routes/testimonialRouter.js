import express from "express";

import { getTestimonials } from "../controllers/testimonialControllers.js";

const testimonialRouter = express.Router();

testimonialRouter.get("/", getTestimonials);

export default testimonialRouter;
