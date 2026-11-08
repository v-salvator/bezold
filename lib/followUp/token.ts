// * no `@/` imports — tests/unit runs this file with plain `node --test`
import { createHash, randomBytes } from "node:crypto";

// * 32 random bytes → 43 url-safe characters. Only its hash is ever stored,
// * so neither the code nor the database can rebuild a working link.
export const createToken = () => randomBytes(32).toString("base64url");

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

// * cheap shape check so garbage `?t=` values never reach Firestore
export const isWellFormedToken = (token: unknown): token is string =>
  typeof token === "string" && TOKEN_PATTERN.test(token);
