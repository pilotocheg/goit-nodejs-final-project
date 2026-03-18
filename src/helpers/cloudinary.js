import { v2 as cloudinary } from "cloudinary";

// Configure via env:
// CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} 

export default cloudinary;
