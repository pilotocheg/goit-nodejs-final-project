import * as categoryServices from "../services/categoryServices.js";

export const getCategories = async (req, res) => {
  const categories = await categoryServices.listCategories();

  res.json(categories);
};
