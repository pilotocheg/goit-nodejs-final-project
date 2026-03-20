import express from "express";
import { createRecipe, getOwnRecipes, searchRecipes, getPopularRecipes, deleteRecipe, getRecipeDetails, getUserRecipes } from "../controllers/recipeController.js";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../helpers/validateBody.js";
import { addRecipeSchema } from "../schemas/recipeSchemas.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/own", authenticate, getOwnRecipes);  
router.get("/users/:id", getUserRecipes);
router.get("/search", searchRecipes);
router.get("/popular", getPopularRecipes);
router.get("/:id", getRecipeDetails);
router.post("/", authenticate, upload.single("thumb"), validateBody(addRecipeSchema), createRecipe);
router.delete("/:id", authenticate, deleteRecipe);

export default router;
