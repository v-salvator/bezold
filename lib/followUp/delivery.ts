// * dev reads the mock collections, whose stores point at real people's
// * accounts — so in dev every follow-up email goes to one test inbox instead
export const isDevEnvironment = () =>
  process.env.NEXT_PUBLIC_ENV_VERSION === "dev";

export const testRecipient = () =>
  process.env.FOLLOW_UP_TEST_RECIPIENT?.trim() || null;

// * where an email for this seller really goes; null = don't send
export const deliveryAddress = (sellerEmail: string | null) =>
  isDevEnvironment() ? testRecipient() : sellerEmail;
