export const getUserClientData = (dbUser) => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  avatarURL: dbUser.avatarURL,
});
