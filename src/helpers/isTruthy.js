const isTruthy = (v) => {
  if (v === undefined || v === null) return false;
  return ["1", "true", "yes", "on"].includes(String(v).trim().toLowerCase());
};

export default isTruthy;
