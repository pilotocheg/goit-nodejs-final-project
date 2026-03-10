import path from "path";
import fs from "fs/promises";

const tempDirPath = path.join(process.cwd(), "temp");
const avatarsDirPath = path.join(process.cwd(), "public", "avatars");

const isAccessible = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    return false;
  }
};

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder, { recursive: true });
  }
};

const initAppFolders = async () => {
  await createFolderIsNotExist(tempDirPath);
  await createFolderIsNotExist(avatarsDirPath);
};

export default initAppFolders;
