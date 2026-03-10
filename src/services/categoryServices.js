import Category from "../db/models/Category.js";

export const listCategories = () =>
  Category.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
