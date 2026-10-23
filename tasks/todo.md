# Tasks: Firestore & Storage Security Rules

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

**Prerequisite (user):** `brew install openjdk@21`, then confirm `java -version` prints 21.

## Phase 1: Tooling

- [x] **T1: Emulator tooling + deny-all rules**
  - Acceptance: `firebase.json` (rules paths, Firestore and Storage emulator ports) and `.firebaserc` (default `bezold`) exist. devDependencies are pinned: `firebase-tools`, `@firebase/rules-unit-testing@^3`. `npm run test:rules` runs `firebase emulators:exec --only firestore,storage --project demo-bezold "node --test --test-concurrency=1 tests/rules/*.test.ts"`. `firestore.rules` and `storage.rules` deny everything. `tests/rules/helpers.ts` sets up the test environment, seeds data with rules disabled, and provides the actor contexts: anonymous, member, owner, other seller, and admin (`{ admin: true }`). One test proves an anonymous read is denied in each service.
  - Verify: `npm run test:rules` passes. → **Checkpoint 1**
  - Files: `firebase.json`, `.firebaserc`, `package.json`, `tsconfig.json` (`allowImportingTsExtensions`), `.gitignore`, `tests/rules/package.json`, `firestore.rules`, `storage.rules`, `tests/rules/helpers.ts`, `tests/rules/firestore.test.ts`, `tests/rules/storage.test.ts`

## Phase 2: Rules (each slice = its rule lines + its tests)

- [x] **T2: User docs**
  - Acceptance: matches the user-docs table in the spec. Tests cover `signup` `setDoc`, `editUserById` (both the update path and the `setDoc` upsert path), `writeBuyerProfile`, admin `addDoc` (`createUserDoc`), and an admin editing another user. Denied: anonymous reads, another member reading someone's contact info, self changing `createTime`, and any delete.
  - Verify: `npm run test:rules`
  - Files: `firestore.rules`, `tests/rules/firestore.test.ts`

- [x] **T3: Store docs — read, create, delete**
  - Acceptance: the owner can `get` their store and run the exact `where("user", "==", uid), orderBy("createTime", "desc")` query. Another seller and anonymous users are denied. An admin can list everything. The SellForm create payload, sent exactly as the code sends it, succeeds. A create is denied when it has `status: 'approved'`, a non-empty `tags` or `images`, `user` set to someone else, or an extra key. Admin creates and deletes succeed. A seller delete is denied.
  - Verify: `npm run test:rules`
  - Files: `firestore.rules`, `tests/rules/firestore.test.ts`

- [x] **T4: Store docs — owner update + status transitions**
  - Acceptance: these succeed: the EditListingForm payload; `updateStoreStatus` from approved→pending, rejected→pending, pending→sold and approved→sold; and an image `arrayUnion` / `arrayRemove` with `updateTime`. These are denied: pending→approved; rejected→approved or →sold; any change to a draft or sold listing; changing `user`, `tags`, `createTime` or `currency`; and an update without `updateTime == request.time`. An admin can make any update. Both `mockStore` and `prodStore` are exercised.
  - Verify: `npm run test:rules`
  - Files: `firestore.rules`, `tests/rules/firestore.test.ts`

- [ ] **T5: Storage**
  - Acceptance: matches the Storage table in the spec. The owner and admin can upload a WebP under 5 MB and can read and delete. These are denied: another seller uploading to someone else's store, anonymous access, a 5 MB file, `image/svg+xml`, `text/html`, an overwrite of an existing file, and any access to `backup/**` or other paths.
  - Verify: `npm run test:rules` → **Checkpoint 2** (user reviews both rules files)
  - Files: `storage.rules`, `tests/rules/storage.test.ts`, `tests/rules/helpers.ts`

## Phase 3: App changes

- [ ] **T6: Upload limit check + clear message**
  - Acceptance: `constant/image.ts` exports `IMAGE_UPLOAD_MAX_BYTES` (5 MB) and `IMAGE_UPLOAD_TYPES`. After resizing, `uploadStoreImageByFile` throws `ImageUploadLimitError` before any Storage call when the file breaks either limit. `StoreImageUpload` shows the limit message for that error and keeps 「上傳失敗」 for everything else. The admin image page shows an antd error notification instead of an unhandled rejection. The upload inputs' `accept` narrows to the allowed types.
  - Verify: in dev, upload an 8 MB photo the browser can shrink (it succeeds) and an SVG (the limit message shows). Lint is clean.
  - Files: `constant/image.ts`, `firebase/clientUtils/image.ts`, `app/(new)/sell/_components/StoreImageUpload.tsx`, `app/admin/store/edit/[storeId]/image/page.tsx`

- [ ] **T7: Sellers can resubmit rejected listings**
  - Acceptance: `ListingCard` shows 編輯 for `rejected` listings. `EditListingForm` no longer redirects rejected listings (drafts are still redirected). Saving the form or changing a photo on a rejected or approved listing writes `status: pending`, and the UI shows the pending state. The comments at both sites are updated.
  - Verify: in dev, as admin, reject a mock listing. As the seller, open 編輯, save, and confirm the listing shows 審核中 in `/my-listings` and the admin list. → **Checkpoint 3**
  - Files: `app/(new)/my-listings/_components/ListingCard.tsx`, `app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx`

## Phase 4: Wrap-up

- [ ] **T8: Docs + final checks + PR**
  - Acceptance: CLAUDE.md gains a short "Security rules" section: where the rules live, `npm run test:rules`, the deploy command, and "new client writes need a rule and a test". `npm run lint` (using the worktree eslint workaround) and `npm run build` pass. The PR description includes the user's deploy steps and the smoke-test checklist from the spec.
  - Verify: lint and build output; the PR is open. → **Checkpoint 4**
  - Files: `CLAUDE.md`

## After merge (user)

1. Deploy the app with T6 and T7 included.
2. Run `npx firebase deploy --only firestore:rules,storage --project bezold`.
3. Run the smoke test on dev data (see the spec's Testing Strategy). To roll back, paste the test-mode rules into the console.
