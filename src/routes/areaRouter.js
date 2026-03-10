import express from "express";

import { getAreas } from "../controllers/areaControllers.js";

const areaRouter = express.Router();

areaRouter.get("/", getAreas);

export default areaRouter;
