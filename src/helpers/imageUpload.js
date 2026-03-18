import HttpError from "./HttpError.js";
import cloudinary from "./cloudinary.js";

const useCloudinary = () => {
  return !!process.env.CLOUDINARY_URL;
};

export async function uploadImageToCloudinary(filePath, { folder, publicId } = {}) {
  if (!useCloudinary()) {
    throw new HttpError(500, "Cloudinary is not configured");
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
    });
    return result;
  } catch (e) {
    throw new HttpError(500, `Cloudinary upload failed: ${e.message}`);
  }
}

export async function deleteCloudinaryByPublicId(publicId) {
  if (!publicId) return;
  if (!useCloudinary()) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // ignore
  }
}
