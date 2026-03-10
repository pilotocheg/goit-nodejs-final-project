import * as areaServices from "../services/areaServices.js";

export const getAreas = async (req, res) => {
  const areas = await areaServices.listAreas();

  res.json(areas);
};
