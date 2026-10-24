export const COLLECTIONS = {
  STORE:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockStore" : "prodStore",
  USER: process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockUser" : "prodUser",
  // * digital-asset inquiries — Admin SDK only (firestore.rules denies clients)
  INQUIRY:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev"
      ? "mockInquiry"
      : "prodInquiry",
};
