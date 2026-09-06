/**
 * fetch wrapper that attaches the admin Firebase ID token as a Bearer header.
 * Pairs with the server-side `verifyAdminToken`. Callers guard against a null
 * idToken themselves (behaviour on a missing token differs per page).
 */
export function authedFetch(
  idToken: string,
  input: string | URL,
  init: RequestInit = {},
) {
  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${idToken}`,
    },
  });
}
