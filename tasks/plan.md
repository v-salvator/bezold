# Implementation Plan: Listing follow-up email + sold feedback

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Design: [`docs/listing-follow-up-prototype.html`](../docs/listing-follow-up-prototype.html)

## Overview

A daily Vercel Cron job emails sellers whose listing has been approved for 60+ days (then every 30 days), through Brevo. The email links to `/listing-check`, a no-login page where the seller confirms 「還在頂讓」 or 「已頂讓」. Confirming sold flips the store to `sold` and shows an optional 頂讓回饋 form. The same form opens as a dialog after 已頂讓 on `/my-listings`. Admins see follow-up counts and a pause switch in Store List, and all feedback on a new Sold Feedback page.

Two PRs, 12 tasks. PR 1 is the follow-up email loop (tasks 1–7). PR 2 is sold feedback (tasks 8–12). Nothing emails real sellers until the user switches it on after PR 2 (see Launch).

## Architecture decisions

- **Kill switch + dry run.** The cron does nothing unless `FOLLOW_UP_ENABLED=true`. `?dryRun=1` returns the due list (store ids, names, recipient domains only) without sending or writing. This lets PR 1 merge and deploy with no risk, and gives a safe first look at prod. _(Added to SPEC env table.)_
- **Pure logic is alias-free.** `tests/unit` runs `node --test` on `.ts` with relative imports. `utils/followUp.ts`, `utils/soldFeedback.ts`, `lib/followUp/token.ts` and `lib/followUp/emailTemplates.ts` import only relative paths and `node:crypto`, never `@/…`, like the modules the existing tests cover.
- **Timestamps → Date in every mapper.** Store mappers convert only `createTime` / `updateTime` today. Any other Timestamp field would reach client components as a Firestore object and break serialization. `approvedTime` and `soldTime` get added to `storeConverter` (client) and the server mappers in `firebase/serverUtils/store.ts` (`mapDocsToStores`, `getStoreById`) in task 1.
- **`approvedTime` is stamped wherever an admin produces an approved store.** That's Store List (single and bulk status change) and the admin create form (`createStoreWithSeller(status)` can create it approved). Drafts only go back to `pending`, so they're untouched. It's written only when absent.
- **No rules or index deploy.** The new collections fall under the existing catch-all deny. `approvedTime` is written by admins (unrestricted), the rest by the Admin SDK. The token lookup is a single-field equality query with an automatic index. Rules **tests** are still added.
- **One shared form component** (`app/(new)/_components/SoldFeedbackForm/`) for `/listing-check` and the `/my-listings` dialog. One API route with two auth modes (token or member ID token).
- **Header PNG** (`public/email/bezold-email-header.png`, @2x) is cropped with `sharp` from the current logo `public/bezold-avatar-v2.png` (not the outdated `bezold-removebg-rect.png`). It's shown to the user for approval before it's saved (standing preference).

## Dependency graph

```
types + collections + approvedTime + mappers (1)
   ├── due logic + token (2) ──┐
   ├── email templates + Brevo (3) ──┐
   │                            │    │
   ├── /listing-check read states (4)│
   │        └── answer API + actions (5) ── needs 3 (confirmation email)
   │                 └── cron + kill switch + dry run (6) ── needs 2, 3
   └── admin follow-up API + column + drawer switch (7) ── needs 1
                    ═══ PR 1 ═══
   parse + feedback API, token path (8) ── needs 5
        └── form component + /listing-check inline (9)
               └── /my-listings dialog + member path (10)
   admin drawer feedback (11) ── needs 8
        └── Sold Feedback page + sidebar (12)
                    ═══ PR 2 ═══
```

## Task list

### PR 1 — follow-up email loop

- [ ] 1. Types, collections, `approvedTime` stamping, mapper fixes, rules tests
- [ ] 2. Due logic + recipient + token (pure) with unit tests
- [ ] 3. Email templates + Brevo client + header PNG
- [ ] 4. `/listing-check` page: read-only states
- [ ] 5. Answer API + confirm actions + confirmation email

**Checkpoint A** (after 5): a hand-seeded mock follow-up doc + token can be answered both ways on the dev server. `test:unit`, `test:rules`, build pass.

- [ ] 6. Cron route, kill switch, dry run, `vercel.json`
- [ ] 7. Admin: follow-up API, 追蹤信 column, drawer section + pause switch

**Checkpoint B / PR 1** (after 7): full dev loop per SPEC → Testing Strategy (backdate → cron → email in the test inbox → answer → admin shows it → pause → cron skips). Gmail web + iOS Mail check. Before/after screenshots (admin list + drawer). The user reviews → push → PR.

### PR 2 — sold feedback

- [ ] 8. `parseSoldFeedback` + `POST /api/sold-feedback` (token path) + server utils
- [ ] 9. `SoldFeedbackForm` + inline on `/listing-check`
- [ ] 10. `/my-listings` dialog + member-auth path

**Checkpoint C** (after 10): both seller paths save feedback once. Skip saves nothing. Replay → 409.

- [ ] 11. Admin drawer 頂讓回饋 section
- [ ] 12. Sold Feedback admin page + sidebar item

**Checkpoint D / PR 2** (after 12): admin page numbers match the seeded feedback. Screenshots. The user reviews → push → PR.

### Launch (the user does these, with Claude's help)

1. Add Vercel env: `BREVO_API_KEY`, `CRON_SECRET`, `FOLLOW_UP_MAX_PER_RUN=20`, `FOLLOW_UP_ENABLED` (leave `false`).
2. Run the prod dry run (`curl -H "Authorization: Bearer …" https://www.bezold.com.tw/api/cron/listing-follow-up?dryRun=1`). Claude summarizes how many stores are due and how many lack an email.
3. Set `FOLLOW_UP_ENABLED=true`. After a quiet launch week, remove `FOLLOW_UP_MAX_PER_RUN` (back to 100).

## Risks and mitigations

| Risk                                                   | Impact | Mitigation                                                                                                        |
| ------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| Dev or a worktree emails a real seller                 | High   | Dev forces `FOLLOW_UP_TEST_RECIPIENT` and refuses without it. Prod needs `FOLLOW_UP_ENABLED=true`. Dry run first. |
| Launch-day backlog (every store > 60 days due at once) | Med    | `FOLLOW_UP_MAX_PER_RUN=20` for the launch week. Dry run shows the count before enabling.                          |
| Timestamp fields leak to client components             | Med    | Mapper fix in task 1. `npm run build` + open `/store/[id]` and admin list on a store with `approvedTime`.         |
| Brevo rejects (sender not verified for API, quota)     | Med    | Task 3 sends one real test mail through the API in dev. Failures write `lastError` and don't count as sent.       |
| Mail clients mangle the layout (Outlook, dark mode)    | Low    | Table + inline styles only. Check Gmail web + iOS Mail. Outlook is best-effort.                                   |
| Hobby cron timing / 10 s default limit                 | Low    | `maxDuration = 60`. Sends run with limited concurrency. The 100 cap keeps a run well under a minute.              |
| Two writers on one token (double click, two tabs)      | Low    | The answer runs in a Firestore transaction that checks `tokenUsed`.                                               |

## Open questions

None. Resolved 2026-11-08: digital assets included; site is on Vercel with Cron; launch backlog → cap 20 for the launch week; sender → `Bezold 頂讓必售`; header → cropped from `bezold-avatar-v2.png`.
