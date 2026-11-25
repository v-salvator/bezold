# Implementation Plan: `listing-copy` (issue #125 items 2 + 3)

Spec: [`SPEC.md`](../SPEC.md) → Module `listing-copy` · Tasks: [`tasks/todo.md`](todo.md)

**Deadline: live in production by 2026-11-30.** One PR, one local commit per task, and the user reviews before push.

## Overview

Remove every "listing is free / 12/1 / 早鳥" claim from the site and replace it with neutral copy that is true before and after 12/1. While doing that, ship the new home description (with a live listing count) and home H1 with 頂讓, and retarget `/sell`'s title, description and H1 at 頂出店面 / 刊登頂讓店面. The copy for every string is fixed in the spec's tables. This plan is about order, mechanics and verification.

## Architecture decisions

- **Home metadata becomes `generateMetadata`.** It runs under the page's existing `revalidate = 60`, so the count refreshes at most once a minute per region. Title and canonical stay identical.
- **Listing count = two Firestore `count()` aggregations**, not a document read. `count(status in [approved, sold])` minus `count(listingType == digital, status in [approved, sold])`. Each costs 1 read per 1,000 docs. Physical stores can't be counted directly because legacy docs have no `listingType` (see `physicalOnly` in `firebase/serverUtils/store.ts`). The digital count uses the same `listingType` + `status` filters as `getDigitalAssets`, which already has a composite index, so no new index is expected. If either count throws, log it and return `null`. The page then uses the description without the number clause and never shows `0 間`.
- **og description is set explicitly** on `/` and `/sell` (`pageMetadata` already does this for `/sell`). The site emits no `twitter:*` tags today, and Twitter/X falls back to `og:*`. The spec's "twitter:description" requirement is met through og, and no twitter block is added.
- **Launch banner keeps the rotator.** Removing the early-bird slide leaves one message. The rotator's interval would then "rotate" index 0 → 0, set `leavingIndex = 0` and animate the only message out. Guard it: with fewer than 2 messages, start no interval and render no dots. This is the riskiest change, so it goes early.
- **`TrustBar` isn't mounted** (`{/* <TrustBar /> */}` in `page.tsx`). Its early-bird stat still changes so the sweep grep comes back clean, but there's nothing to screenshot.
- **FAQ text and JSX stay in one place.** `Faq.tsx` and `faqData.tsx` keep the plain `text` field (it feeds FAQPage JSON-LD on `/`, `/faq` and `/sell`) and the rendered JSX in sync.

## Task list

### Phase 1: SEO surfaces from the issue (highest value, deadline-critical)

- [x] Task 1: Home description with a live count, plus root `SITE_DESCRIPTION` and llms.txt
- [x] Task 2: Home hero H1 with 頂讓, plus hero free-copy removal
- [x] Task 3: `/sell` metadata, H1, subheading, guide lines and submit label

### Checkpoint A: after Tasks 1–3

- [x] Build and lint pass. Rendered `/` and `/sell` head tags and H1s match the spec
- [ ] The user reviews → local commits stay. If time runs short, these alone could ship before 11/30

### Phase 2: Site-wide sweep

- [x] Task 4: Launch banner: remove the early-bird slide and make the rotator safe with one message
- [x] Task 5: Home sections (SellerCta, HowItWorks, WhyUs, home Faq, TrustBar)
- [x] Task 6: Shared FAQ, /about, nav button, footer, guide seller steps
- [x] Task 7: Remaining CTAs (store-example, my-listings, digital assets, blog Cta)

### Checkpoint B: complete

- [x] The sweep grep returns 0 hits (see todo.md)
- [x] Build and lint pass, and the dev server shows no console errors on `/`, `/sell`, `/faq`, `/about`, `/store-guide`, `/my-listings`, `/digital-assets`
- [ ] Before/after screenshots (main on :3001 vs branch on :3000) in the PR
- [ ] The user reviews → push → PR → merge and deploy by 11/30 → user requests re-indexing in GSC for `/` and `/sell`

## Risks and mitigations

| Risk                                                                | Impact                                               | Mitigation                                                                                                                                                                                            |
| ------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Miss the 11/30 deadline                                             | High: wrong copy appears in search results from 12/1 | Phase 1 is shippable on its own. Phase 2 is all string edits, about an hour                                                                                                                           |
| The digital `count()` needs an index that doesn't exist             | Med: the count throws                                | Fallback copy without a number. Try it on dev (mock collections share the index set). If an index is needed, add it to `firestore.indexes.json` for both `mock*` and `prod*`, and the user deploys it |
| The single-message banner animates out or shows a lone dot          | Med: visible on every page                           | Task 4 guard plus a manual check at desktop and 375 px, with reduced motion on and off                                                                                                                |
| Copy changes shift layout (SellerCta stats, hero lines)             | Low                                                  | Before/after screenshots at desktop and 375 px                                                                                                                                                        |
| #121 (acceleration copy) lands first and edits `AccelerationBanner` | Low: merge conflict                                  | Rebase before PR. Only one phrase is removed here                                                                                                                                                     |
| The dev server hits prod data                                       | Low                                                  | Check `NEXT_PUBLIC_ENV_VERSION=dev` in `.env.development` before `npm run dev`                                                                                                                        |

## Open questions

None. All copy is fixed in `SPEC.md`.
