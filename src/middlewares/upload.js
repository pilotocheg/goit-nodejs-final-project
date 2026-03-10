import multer from "multer";
import path from "path";
import HttpError from "../helpers/HttpError.js";

const destination = path.resolve("temp");

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniquePrefix}_${file.originalname}`;
    cb(null, filename);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 10, // 10 mb max
};

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split(".").pop();
  if (extension === "exe") {
    return cb(new HttpError(400, ".exe files are not allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits,
  fileFilter,
});

export default upload;
