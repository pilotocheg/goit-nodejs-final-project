export const getUserClientData = (dbUser) => ({
  name: dbUser.name,
  email: dbUser.email,
  avatarURL: dbUser.avatarURL,
});
