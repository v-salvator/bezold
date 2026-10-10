# Firebase Rules: email verification

The app hides listing forms from unverified members, but the browser writes
listings straight to Firestore and uploads images straight to Storage. Without
these rule changes, an unverified account could still write by calling the SDK
directly. Apply them in the Firebase Console **after** the deploy and the
`mark-existing-users-verified` script, or existing sellers lose write access
until the script runs.

The rules are not stored in this repo, so the snippets below show only the
condition to add. Merge it into the existing `allow` lines. Don't replace the
whole file.

## The condition

```
request.auth != null && request.auth.token.email_verified == true
```

`email_verified` comes from the member's ID token. A member who just verified
gets the new claim when the app force-refreshes their token, which
`refreshVerification()` already does.

## Firestore

Add the condition to **create and update** on both store collections. `dev`
uses `mockStore` and prod uses `prodStore` (see `firebase/constants.ts`).

```
match /prodStore/{storeId} {
  allow create, update: if <existing condition>
    && request.auth.token.email_verified == true;
}

match /mockStore/{storeId} {
  allow create, update: if <existing condition>
    && request.auth.token.email_verified == true;
}
```

Leave **reads** as they are, since listings are public.

**Do not** add the condition to `prodUser` / `mockUser`. `signup()` writes the
user doc right after creating the account, before the member could have
verified. Requiring verification there would make every signup fail.

Admin writes go through the Admin SDK (`firebase/server.ts`), which bypasses
rules, so the admin dashboard is unaffected.

## Storage

Store images are uploaded to `{mockStore|prodStore}/{storeId}/{fileName}` (see
`firebase/clientUtils/image.ts`). Add the condition to **writes** on those
paths:

```
match /prodStore/{storeId}/{fileName} {
  allow write: if <existing condition>
    && request.auth.token.email_verified == true;
}

match /mockStore/{storeId}/{fileName} {
  allow write: if <existing condition>
    && request.auth.token.email_verified == true;
}
```

Leave **reads** as they are.

## Checking the rules after applying them

1. **Verified account:** publish a test listing on `/sell` with an image, then
   edit it from `/my-listings`. Both should succeed.
2. **Unverified account:** sign in and open `/sell`. The page shows the
   verification card. To confirm the rule itself, run a store write from the
   browser console, or use the Rules Playground in the Console with a token
   whose `email_verified` is `false`. Firestore should return
   `permission-denied`.
3. **New signup:** create an account on `/signup`. It should reach
   `/verify-email` without errors, which confirms the user doc write is still
   allowed.
