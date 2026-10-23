# Implementation Plan: Firestore & Storage Security Rules

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md)

## Overview

Replace test-mode rules with least-privilege Firestore and Storage rules, kept in the repo and tested against the emulator. Add the two small app changes the rules imply: sellers can resubmit rejected listings, and the upload UI explains the 5 MB / image-type limit. Everything lands on branch `claude/firestore-rules-setup-f0d0c3` as one PR, with one commit per task. The user deploys the rules after the PR merges.

## Architecture Decisions

- **Rules start as deny-all, then open one slice at a time.** Each task adds one collection's or one operation's `allow` lines together with their tests. A missing case fails closed, and every slice can be checked on its own.
- **Tests mirror the app's real payloads.** Every client write in the app gets a test that sends the same fields the code sends. If a rule would break `/sell`, `/my-listings` or `/admin`, a test fails before the deploy does.
- **`demo-bezold` project ID for tests.** The emulator keeps `demo-*` projects offline, so a misconfigured test can't touch real data.
- **One rules file covers mock and prod.** Collections are matched by name (`isStoreCol` / `isUserCol`), not hardcoded per environment.
- **The upload limits live in `constant/image.ts`.** The browser check and the test use the same numbers. The rules file can't import TS, so `storage.rules` repeats 5 MB with a comment pointing at the constant.
- **No `firestore.indexes.json`.** Indexes stay in the console. A deploy with the file present could drop the console-made composite index that `getStoresByUserId` needs.
- **App changes before the rules deploy.** If the rules went live first, rejected-listing edits would be allowed but unreachable in the UI, and too-big uploads would show the generic error. Nothing breaks either way, but deploying the app first is cleaner.

## Dependency Graph

```
T1 tooling + deny-all ──┬── T2 user docs
                        ├── T3 store read/create/delete ── T4 store owner update
                        └── T5 storage (needs store docs seeded; reuses T3 helpers)
T6 upload limit UX ──────── (independent of rules code; T5 tests reuse its constant)
T7 rejected resubmit ────── (independent; T4 already allows rejected → pending)
T8 docs + final checks ──── after all
```

T6 and T7 touch only app files and could run in parallel with T2–T5. They're small, so I'll do them in order here.

## Checkpoints (stop for the user's review, then commit)

1. **After T1:** the emulator runs on your machine and `npm run test:rules` is green with deny-all.
2. **After T5:** all rules are written and every test passes. Review `firestore.rules` and `storage.rules`.
3. **After T7:** the app changes are verified in the browser on dev data.
4. **After T8:** `npm run lint` and `npm run build` pass. Open the PR, then hand off the deploy steps.

## Risks & Mitigations

| Risk                                                                      | Mitigation                                                                                                                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Java isn't installed, so the emulator won't start                         | The user runs `brew install openjdk@21` before T1 verification. T1 stops there if Java is missing.                                                                                            |
| Rules break a client flow I missed                                        | Tests cover every client call found in the survey. After the deploy, a manual smoke test runs on dev data. Rollback: paste test mode back into the console (takes seconds).                   |
| The Storage `firestore.get()` lookup doesn't work in the emulator         | Run the Firestore and Storage emulators together in `emulators:exec`. Recent `firebase-tools` versions support cross-service rules.                                                           |
| `next build` type-checks `tests/`                                         | Tests import helpers as `./helpers.ts`, so `tsconfig.json` sets `allowImportingTsExtensions` (valid because `noEmit` is already set). `tsc --noEmit` passes. Confirm with `next build` in T8. |
| Owner store read is denied for a list query that doesn't filter on `user` | The only owner list query is `where("user", "==", uid)`, which matches. A test runs that exact query.                                                                                         |
| One deploy changes dev and prod at once                                   | The emulator tests come first. Run the dev smoke test right after the deploy and keep the test-mode rules text on hand to roll back.                                                          |
