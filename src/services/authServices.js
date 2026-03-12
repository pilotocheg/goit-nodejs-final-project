import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import User from "../db/models/User.js";
import { generateUUID } from "../helpers/uuidHelper.js";
import { createToken } from "../helpers/jwtToken.js";
import { comparePassword, hashPassword } from "../helpers/hash.js";
import HttpError from "../helpers/HttpError.js";

export const getUserClientData = (dbUser) => ({
  name: dbUser.name,
  email: dbUser.email,
  avatarURL: dbUser.avatarURL,
});

export const findUser = (where) => User.findOne({ where });

export const createUser = async ({ name, password, email }) => {
  const hashedPassword = await hashPassword(password);

  const avatarURL = gravatar.url(email, { protocol: "https", s: "200" });

  const newUser = await User.create({
    id: generateUUID(),
    name,
    email,
    password: hashedPassword,
    avatarURL,
  });

  return {
    user: getUserClientData(newUser),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUser({ email });

  if (!user) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const passwordCorrect = await comparePassword(password, user.password);

  if (!passwordCorrect) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const token = createToken({ id: user.id });

  await user.update({ token });

  return {
    token,
    user: getUserClientData(user),
  };
};

export const logoutUser = (user) => user.update({ token: null });

export const updateUserAvatar = async (user, file) => {
  let avatarURL = null;
  if (file) {
    const newPath = path.resolve("public", "avatars", file.filename);
    await fs.rename(file.path, newPath);
    avatarURL = path.join("avatars", file.filename);
  }

  await user.update({ avatarURL });

  return avatarURL;
};
