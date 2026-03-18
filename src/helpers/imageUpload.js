import HttpError from "./HttpError.js";
import cloudinary from "./cloudinary.js";

const useCloudinary = () => {
  const hasUrl = !!process.env.CLOUDINARY_URL;
  const hasParts =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;
  return hasUrl || hasParts;
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
