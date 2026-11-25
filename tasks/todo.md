# Tasks: `listing-copy` (issue #125 items 2 + 3), due 2026-11-30

Spec: [`SPEC.md`](../SPEC.md) → Module `listing-copy` · Plan: [`tasks/plan.md`](plan.md)

Every task: run prettier on changed files, build and lint pass, and the strings are exactly as in the spec tables.

```bash
npm run build
npx eslint --no-eslintrc -c .eslintrc.json app components utils lib constant firebase
```

---

## Task 1: Home description with a live count, plus root `SITE_DESCRIPTION` and llms.txt

**Description:** Add a server helper that counts physical stores that are on sale or sold. Switch the home page from static `metadata` to `generateMetadata` so the description reads 「頂讓網 Bezold：全台店面頂讓平台，{N} 間真實刊登，…」 and og:description matches. Update the root fallback `SITE_DESCRIPTION` (no count) and the llms.txt intro line.

**Acceptance criteria:**

- [x] `countListedPhysicalStores()` returns `count(status in [approved, sold]) − count(listingType == digital, status in [approved, sold])`, or `null` on error (logged)
- [x] `/` renders the spec description with a real number, og:description is identical, and the title and canonical are unchanged. With `null` it renders the no-number variant
- [x] `SITE_DESCRIPTION` and `/llms.txt` match the spec, with no 12/1 or 免費刊登

**Verification:**

- [x] `curl -s localhost:3000/ | grep -o '<meta name="description"[^>]*>\|<meta property="og:description"[^>]*>'` shows the new copy and N
- [x] Spot-check N against the admin store list (approved + sold, physical) on mock data
- [x] `curl -s localhost:3000/llms.txt | head -5`

**Dependencies:** None

**Files likely touched:**

- `firebase/serverUtils/store.ts` (+ re-export in `firebase/serverUtils/index.ts` if that's the pattern)
- `app/(new)/page.tsx`
- `constant/seo.ts`
- `app/llms.txt/route.ts`

**Estimated scope:** Medium (4–5 files)

---

## Task 2: Home hero H1 with 頂讓, plus hero free-copy removal

**Description:** Change the H1 to 找一間<em>準備好</em>的頂讓店 / 開門就營業, keeping the two animated lines. The existing kicker stays as the eyebrow and becomes a `<p>` if it isn't one already. Replace the hero sub line, the seller-column lead and the CTA label per the spec.

**Acceptance criteria:**

- [x] `/` has exactly one `<h1>`, and its text is 找一間準備好的頂讓店開門就營業
- [x] No 12/1, 早鳥 or 免費刊登 remains in `HeroSplit` (「免費建立帳號」 stays)
- [x] Line 1 still fits on one line at 375 px. If it wraps, adjust the font clamp in `HeroSplit.module.css`

**Verification:**

- [x] `curl -s localhost:3000/ | grep -c '<h1'` → 1
- [x] Screenshot of the hero at desktop and 375 px

**Dependencies:** None

**Files likely touched:**

- `app/(new)/_components/HeroSplit/index.tsx`
- `app/(new)/_components/HeroSplit/HeroSplit.module.css` (only if line 1 wraps)

**Estimated scope:** Small

---

## Task 3: `/sell` metadata, H1, subheading, guide lines and submit label

**Description:** Update `/sell` to the spec: the title 刊登頂讓店面｜頂出店面找接手人，成交不抽成 (the layout template adds ｜頂讓網 Bezold), the new description, the H1 刊登你的店，<strong>找到接手人</strong>, and the new subheading. Remove the two early-bird lines from `SellGuide` and change the form's submit label to 送出刊登 (keep 提交中...).

**Acceptance criteria:**

- [x] The rendered `<title>` ends with exactly one 「｜頂讓網 Bezold」, and description and og:description match the spec
- [x] One `<h1>` = 刊登你的店，找到接手人. `<strong>` keeps the current accent style
- [x] `SellGuide` has no 12/1 or fee lines, and its list still renders without an empty bullet

**Verification:**

- [x] `curl -s localhost:3000/sell` → title, meta and h1. The page redirects signed-out users client-side, but the head and H1 are in the server HTML
- [x] Screenshot of the heading and guide (use script-blocking per CLAUDE.md)

**Dependencies:** None

**Files likely touched:**

- `app/(new)/sell/page.tsx`
- `app/(new)/sell/_components/SellGuide.tsx`
- `app/(new)/sell/_components/SellForm.tsx`

**Estimated scope:** Small (3 files)

---

## Checkpoint A: after Tasks 1–3

- [ ] Build and lint pass
- [ ] Head tags and H1 on `/` and `/sell` match the spec
- [ ] The user reviews (commit per task after OK)

---

## Task 4: Launch banner: remove the early-bird slide and make the rotator safe with one message

**Description:** Delete the `early-bird` message from `bannerMessages()`. With one message left, the rotator must not start its interval (otherwise it sets `leavingIndex` to the active index and animates the only message out), and it must not render navigation dots.

**Acceptance criteria:**

- [x] With one message: no interval, no slide-out, no dots. The message is static and clickable
- [x] With 2 or more messages (temporarily re-add one locally to test), the rotation behaves exactly as before
- [x] Both the pre-launch and post-launch digital-asset variants still render correctly

**Verification:**

- [x] Dev server: watch the banner for more than 10 s at desktop and 375 px. No movement, no console errors
- [x] Screenshot of the banner at desktop and 375 px

**Dependencies:** None

**Files likely touched:**

- `app/(new)/_components/LaunchBannerRotator.tsx`
- `app/(new)/_components/LaunchBanner.module.css` (only if the dots' container leaves a gap)

**Estimated scope:** Small

---

## Task 5: Home sections (SellerCta, HowItWorks, WhyUs, home Faq, TrustBar)

**Description:** Apply the spec's copy table to the home page sections, including the fee FAQ answer (its `text` and JSX stay in sync) and the unmounted `TrustBar` stat (→ 5 分鐘 · 填完上架).

**Acceptance criteria:**

- [x] All strings match the spec table. SellerCta's stat shows **0 仲介**, and the 「不抽成交抽成」 typo is fixed
- [x] The home FAQPage JSON-LD fee answer has no listing-fee or free-listing sentence
- [x] SellerCta's 3-stat row keeps its layout at desktop and 375 px

**Verification:**

- [x] `curl -s localhost:3000/ | grep -c '12/1\|早鳥'` → 0
- [x] Screenshots of HowItWorks, WhyUs and SellerCta at desktop and 375 px

**Dependencies:** None

**Files likely touched:**

- `app/(new)/_components/SellerCta.tsx`
- `app/(new)/_components/HowItWorks.tsx`
- `app/(new)/_components/WhyUs.tsx`
- `app/(new)/_components/Faq.tsx`
- `app/(new)/_components/TrustBar.tsx`

**Estimated scope:** Medium (5 files, strings only)

---

## Task 6: Shared FAQ, /about, nav button, footer, guide seller steps

**Description:** Update `faqData.tsx` (fee answer `text` and JSX, plus the how-to answer's 「+ 刊登店面」), `/about`'s fee sentence, the nav `SellButton` label, the footer link and `/store-guide`'s seller step 1.

**Acceptance criteria:**

- [ ] `/faq` and `/sell` FAQPage JSON-LD contain no 12/1, 早鳥 or 免費刊登
- [ ] The nav button reads 「+ 刊登店面」 and fits the nav at 375 px without wrapping
- [ ] `/about`, the footer and `/store-guide` match the spec

**Verification:**

- [ ] `curl` `/faq`, `/about`, `/store-guide` and grep for `12/1|早鳥|免費刊登` → 0
- [ ] Screenshot of the nav at 375 px

**Dependencies:** None

**Files likely touched:**

- `app/(new)/faq/_components/faqData.tsx`
- `app/(new)/about/page.tsx`
- `app/(new)/_components/SellButton.tsx`
- `app/(new)/_components/SiteFooter.tsx`
- `app/(new)/store-guide/_components/SellerSteps.tsx`

**Estimated scope:** Medium (5 files, strings only)

---

## Task 7: Remaining CTAs (store-example, my-listings, digital assets, blog Cta)

**Description:** Change the rest of the free-listing labels: 立即免費刊登 → 立即刊登 on store-example and my-listings, remove 「免費刊登不變。」 from `AccelerationBanner` (rebase first if #121 has landed), 賣家免費刊登 / 免費刊登數位資產 → 賣家刊登 / 刊登數位資產 in the digital-asset components, and the blog Cta default text.

**Acceptance criteria:**

- [ ] Strings match the spec table
- [ ] `AccelerationBanner` still reads as a complete sentence after the phrase is removed
- [ ] **The sweep is clean:** `grep -rnE "12/1|限時免費|免費刊登|早鳥" app components constant content lib utils` → 0 hits

**Verification:**

- [ ] The sweep grep above
- [ ] `/my-listings` (signed in, mock seller) and `/digital-assets` render without console errors

**Dependencies:** None

**Files likely touched (8 files, one string each):**

- `app/(new)/store-example/_components/ExampleBanner.tsx`
- `app/(new)/my-listings/_components/MyListingsContent.tsx`
- `app/(new)/my-listings/_components/AccelerationBanner.tsx`
- `app/(new)/digital-assets/_components/DigitalAssetsTeaser.tsx`
- `app/(new)/digital-assets/_components/DigitalAssetResults.tsx`
- `app/(new)/_components/DigitalAssets/index.tsx`
- `components/blog/Cta.tsx`
- `content/blog/*.mdx` (re-check only; none today)

**Estimated scope:** Small in effort (one string per file) even though it touches more than 5 files

---

## Checkpoint B: complete

- [ ] The sweep grep returns 0 hits
- [ ] Build and lint pass. No console errors on `/`, `/sell`, `/faq`, `/about`, `/store-guide`, `/my-listings`, `/digital-assets`
- [ ] Before/after screenshots via the `before-and-after` skill (main worktree on :3001, branch on :3000): hero, banner, HowItWorks/WhyUs/SellerCta, `/sell` heading, nav at 375 px
- [ ] The user reviews → push → PR (links #125, `SPEC.md` → `listing-copy`) → merge and deploy **by 11/30**
- [ ] Post-deploy (user): GSC re-indexing for `/` and `/sell`
