import express from "express";
import { getIngredients } from "../controllers/ingredientsController.js";

const ingredientsRouter = express.Router();

ingredientsRouter.get("/", getIngredients);

export default ingredientsRouter;
