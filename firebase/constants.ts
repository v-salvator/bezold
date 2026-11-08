export const COLLECTIONS = {
  STORE:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockStore" : "prodStore",
  USER: process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockUser" : "prodUser",
  // * digital-asset inquiries — Admin SDK only (firestore.rules denies clients)
  INQUIRY:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev"
      ? "mockInquiry"
      : "prodInquiry",
  // * listing follow-up email state, one doc per store — Admin SDK only
  FOLLOW_UP:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev"
      ? "mockFollowUp"
      : "prodFollowUp",
  // * 頂讓回饋 after a store is marked sold, one doc per store — Admin SDK only
  SOLD_FEEDBACK:
    process.env.NEXT_PUBLIC_ENV_VERSION === "dev"
      ? "mockSoldFeedback"
      : "prodSoldFeedback",
};
