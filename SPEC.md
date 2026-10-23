# Spec: Firestore & Storage Security Rules

## Objective

The `bezold` Firebase project currently runs Firestore and Storage in **test mode** (open read/write). Anyone holding the public client config — which ships in every page's JS bundle — can read every seller's phone / LINE / email from `prodUser`, approve their own listing, rewrite or delete other sellers' stores, and upload arbitrary files to `bezold.appspot.com` (which we pay egress on).

We are replacing test mode with least-privilege rules, kept in the repo, covered by emulator tests, and deployed with the Firebase CLI.

**Key fact that shapes the rules:** every public page (home, `/store-list`, `/store/[id]`, sitemap, `/api/stores/*`) reads through the **Admin SDK** on the server, which bypasses rules. The browser SDK is used only by:

| Actor                 | Where                                    | Operations                                                                                                |
| --------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| New member            | `lib/auth/signup.ts`                     | `setDoc` own user doc (id = uid)                                                                          |
| Member                | `lib/user/buyerProfile.ts`               | `updateDoc` own user doc                                                                                  |
| Seller                | `/sell` `SellForm`                       | get/upsert own user doc; `addDoc` store (`status: pending`)                                               |
| Seller                | `/my-listings`, `/my-listings/edit/[id]` | query `where user == uid`; get own store; edit fields; status → `pending` / `sold`; upload/delete images  |
| Admin (claim `admin`) | `/admin/**`                              | list all stores; edit any store/user; create stores + "boss" user docs via `addDoc`; upload/delete images |

So the client rules can be strict: **no anonymous client reads at all**.

## Tech Stack

- Firestore rules `rules_version = '2'`, Storage rules `rules_version = '2'` (cross-service `firestore.get()` for store ownership)
- `firebase-tools` (new devDependency, pinned — the global install is 10.1.2 from 2022) for emulators + deploy
- `@firebase/rules-unit-testing@^3` (the last line compatible with our `firebase@10.6`; v4+ requires firebase 13)
- Node 24 built-in runner (`node --test`, runs `.ts` directly) — no runner exists today. Vitest was the first choice, but its current release has a peer conflict with the pinned `@types/node@20.6.3`, and the built-in runner needs no dependency at all
- **Java 21 runtime** (prerequisite for the emulators; not installed — `/usr/bin/java` is the macOS stub). Install: `brew install openjdk@21`

## Commands

```bash
nvm use
npm run test:rules        # firebase emulators:exec --only firestore,storage --project demo-bezold "node --test --test-concurrency=1 tests/rules/*.test.ts"
npx firebase deploy --only firestore:rules,storage --project bezold   # run by the user, not by Claude
npm run lint
npm run build
```

The tests use the `demo-bezold` project ID: the emulator treats `demo-*` as offline-only, so tests can never reach the real project.

## Project Structure

```
firebase.json            → points at the rules files + emulator ports
.firebaserc              → default project "bezold"
firestore.rules          → Firestore rules
storage.rules            → Storage rules
tests/rules/
  helpers.ts             → initializeTestEnvironment, seed data, auth contexts (anon / member / owner / other / admin)
  firestore.test.ts      → catch-all + anonymous checks
  users.test.ts          → user docs, per collection × actor
  stores.test.ts         → store docs: read, create, delete, owner update + status flow
  storage.test.ts        → store photos, backup/ and other paths
tests/rules/package.json → {"type": "module"} so Node loads the tests as ESM
```

`firestore.indexes.json` is **not** added — indexes stay managed in the console (adding the file would let a deploy overwrite them).

## Rules Design

### Helpers (Firestore)

```
function signedIn()   { return request.auth != null; }
function isAdmin()    { return signedIn() && request.auth.token.admin == true; }
function isSelf(uid)  { return signedIn() && request.auth.uid == uid; }
function isStoreCol(c){ return c in ['mockStore', 'prodStore']; }
function isUserCol(c) { return c in ['mockUser', 'prodUser']; }
```

Collections are matched by name with `/{collection}/{docId}` + `isStoreCol()` / `isUserCol()`, so one rules file covers dev and prod. **Anything not matched is denied.**

### Store docs (`mockStore` / `prodStore`)

| Op     | Allowed when                                                                                                                                                                                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| read   | `isAdmin()` **or** `resource.data.user == request.auth.uid` (covers `get` and the `where user == uid` list query)                                                                                                                                                                                                                                                                 |
| create | `isAdmin()` **or** (signed in, `user == uid`, `status == 'pending'`, `tags == []`, `images == []`, `createTime == request.time`, `updateTime == request.time`, and keys ⊆ the SellForm payload: `storeName city district location description price priceNegotiable category areaPing monthlyRent equipment tags currency user images status createTime updateTime`)              |
| update | `isAdmin()` **or** (owner, current status ∈ `pending approved rejected`, `updateTime == request.time`, changed keys ⊆ `storeName city district location description price priceNegotiable category areaPing monthlyRent equipment images status updateTime`, and status unchanged **or** one of: `approved → pending`, `rejected → pending`, `pending → sold`, `approved → sold`) |
| delete | `isAdmin()` only (the app deletes via the Admin SDK API route today, so in practice nobody)                                                                                                                                                                                                                                                                                       |

Owners can never change `user`, `tags`, `createTime`, `currency`, approve their own listing, or touch a `draft` (admin is reworking it) or `sold` listing. A `rejected` listing can only go back to `pending` (resubmit), never straight to `approved` or `sold`.

**Resubmitting rejected listings (app change).** Today sellers can't edit rejected listings at all: `ListingCard` hides 編輯 and `EditListingForm` redirects away. This change lets a seller edit a rejected listing, and any edit (form save, photo upload, or photo delete) resubmits it as `pending`, just as an approved listing goes back to review today.

### User docs (`mockUser` / `prodUser`) — hold seller contact info

| Op     | Allowed when                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| read   | `isSelf(docId)` or `isAdmin()`                                                                                      |
| create | `isSelf(docId)` (signup `setDoc`, `editUserById` upsert) or `isAdmin()` (`createUserDoc` uses `addDoc` = random id) |
| update | `isSelf(docId)` or `isAdmin()`; self may not change `createTime`                                                    |
| delete | denied                                                                                                              |

### Storage

Path: `/{collection}/{storeId}/{fileName}` where `collection` ∈ `mockStore | prodStore`.

```
function storeOwner(c, id) {
  return firestore.get(/databases/(default)/documents/$(c)/$(id)).data.user == request.auth.uid;
}
```

| Op     | Allowed when                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| read   | `isAdmin()` or `storeOwner()` — needed for `getDownloadURL`; public pages use Admin SDK download-token URLs, which bypass rules                                                                         |
| create | file is new (`resource == null`) **and** (`isAdmin()` or `storeOwner()` on a pending / approved / rejected listing) **and** `contentType.matches('image/(jpeg\|png\|webp\|gif)')` **and** `size < 5 MB` |
| update | denied (file names are unique; nothing overwrites)                                                                                                                                                      |
| delete | `isAdmin()` or `storeOwner()` on a pending / approved / rejected listing                                                                                                                                |

**Upload limits (app change).** The browser resize usually brings photos well under 5 MB. It hands back the original file when it can't shrink one: a HEIC photo in Chrome, an SVG, a GIF, or an encoder failure. Those uploads would now be rejected with the generic 「上傳失敗」 message. To give a clear message instead, `uploadStoreImageByFile` checks the resized file against the shared `IMAGE_UPLOAD_MAX_BYTES` / `IMAGE_UPLOAD_TYPES` constants (`constant/image.ts`) before uploading and throws a typed error. The seller upload UI shows 「照片太大或格式不支援（JPG / PNG / WebP / GIF，5 MB 以內）」, and the admin image page shows an error notification. SVG is excluded on purpose, because SVG files served from our bucket could run scripts.

`backup/**` and every other path: denied. The cleanup / backfill scripts use the Admin SDK and are unaffected.

Owners can still read photos on draft / sold listings but not change them. Otherwise `delateStoreImage` would delete the file and then fail the Firestore update, leaving a broken path. The emulator evaluates an overwrite as `create`, which is why the explicit `resource == null` guard is there.

`getDownloadURL` tokens already issued keep working regardless of rules — existing cached image URLs don't break.

## Code Style

Match the existing comment style (`// *` notes, short "why" comments). Example of a test:

```ts
describe("prodStore update — owner", () => {
  it("can send an approved listing back to pending", async () => {
    await seedStore("store1", { user: "seller", status: "approved" });
    const db = env.authenticatedContext("seller").firestore();
    await assertSucceeds(
      updateDoc(doc(db, "prodStore", "store1"), {
        status: "pending",
        updateTime: serverTimestamp(),
      }),
    );
  });

  it("cannot approve their own listing", async () => {
    await seedStore("store1", { user: "seller", status: "pending" });
    const db = env.authenticatedContext("seller").firestore();
    await assertFails(
      updateDoc(doc(db, "prodStore", "store1"), {
        status: "approved",
        updateTime: serverTimestamp(),
      }),
    );
  });
});
```

Readable variable names, prettier after every file.

## Testing Strategy

- **Emulator tests** (`tests/rules/*.test.ts`), one `assertSucceeds` / `assertFails` per row of the tables above, for every actor: anonymous, member (no stores), owner, other seller, admin.
- **Every real client call in the app gets a "succeeds" test** that mirrors its exact payload (SellForm create, EditListingForm edit, ListingCard sold, image upload `arrayUnion`, signup `setDoc`, `editUserById` upsert, `writeBuyerProfile`, admin `addDoc` user). This is the regression guard against the rules breaking the app.
- Both collection names (`mock*`, `prod*`) are exercised at least once.
- **App changes (T6, T7):** the limit check is verified in Node against every boundary (just under 5 MB, exactly 5 MB, SVG, HEIC, empty type). The UI paths need a signed-in seller and admin, so they are covered by the smoke test below, not by an automated browser run.
- **Manual smoke test after deploy**, against the dev (`mock*`) data: sign up → `/sell` → upload photo (and one over 5 MB) → `/my-listings` edit → admin rejects it → seller edits it and it shows 審核中 → mark sold; admin list / edit / image page / drafts / analytics. Public home, store list, store page still render.

## Boundaries

- **Always:** run `npm run test:rules` before each commit; keep the test emulator on `demo-bezold`; mirror real payloads in tests; prettier.
- **Ask first:** installing Java (a system-level install — the user runs `brew install`); any app-code change beyond the two listed above (rejected resubmit, upload limit message); adding the indexes file.
- **Never:** run `firebase deploy` (the user deploys); point tests at the real `bezold` project; commit before the user reviews; touch `main` directly.

## Success Criteria

1. `firestore.rules`, `storage.rules`, `firebase.json`, `.firebaserc` exist in the repo; no test-mode rule remains.
2. `npm run test:rules` passes and covers every row in the three tables above, plus every client call listed in the Objective.
3. Anonymous client: denied on every read and write, in both services.
4. A signed-in non-owner cannot read another user's doc (contact info) or another seller's store.
5. An owner cannot approve their own store, change `user` / `tags`, edit a draft or sold listing, upload a non-image or SVG, or upload a file of 5 MB or more.
6. A seller can open 編輯 on a rejected listing; saving, or adding or removing a photo, moves it to `pending`.
7. Uploading a file over 5 MB, or one the browser couldn't shrink, shows the specific limit message, not 「上傳失敗」.
8. After the user deploys, the manual smoke test passes with no `permission-denied` errors in the console.

## Decisions

1. **Rejected listings:** the seller can edit them, and any edit resubmits as `pending` (decided 2026-10-23).
2. **Upload cap:** 5 MB (first set to 2 MB, then raised on 2026-10-23), for sellers and admins alike, enforced by the rules and checked first in the browser.
3. **Deploy:** one `firebase deploy` covers dev and prod together (same project). Run the smoke test on dev data right after. To roll back, paste the test-mode rules back into the console.
