export const COLLECTIONS = {
  STORE:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockStore" : "prodStore",
  USER: process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockUser" : "prodUser",
};
