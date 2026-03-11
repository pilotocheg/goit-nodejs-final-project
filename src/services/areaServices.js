import Area from "../db/models/Area.js";

export const listAreas = () =>
  Area.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
  });
