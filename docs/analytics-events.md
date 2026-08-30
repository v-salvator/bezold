# Analytics Events

## Overview

The site uses **Firebase Analytics (GA4)**. Initialization is browser-only and
lazy — see [`firebase/client.ts`](../firebase/client.ts) (`getAnalyticsClient`,
`trackEvent`). Page views are sent automatically by
[`components/AnalyticsTracker.tsx`](../components/AnalyticsTracker.tsx), mounted
once in the root layout. All custom events go through the `trackEvent()` helper,
which safely no-ops on the server and on unsupported browsers.

---

## Event reference

| Event                    | When it fires                                                           | Parameters                                 | Fired from                                                                                         |
| ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `page_view`              | Every client-side route change (App Router). Excludes `/admin/*`.       | `page_path`, `page_location`, `page_title` | [`AnalyticsTracker.tsx`](../components/AnalyticsTracker.tsx)                                       |
| `sell_cta_click`         | User clicks any "免費刊登" CTA                                          | `cta_location`                             | See CTA table below                                                                                |
| `store_listing_submit`   | A store listing is **successfully created** (after the Firestore write) | `store_id`, `category`, `city`             | [`SellForm.tsx`](<../app/(new)/sell/_components/SellForm.tsx>)                                     |
| `store_listing_edit`     | A store listing is **successfully updated** (after the Firestore write) | `store_id`, `category`, `city`             | [`EditListingForm.tsx`](<../app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx>) |
| `sign_up`                | An account is **successfully created** (auth + user doc)                | `method` (`"email"`)                       | [`SignupForm.tsx`](<../app/(new)/signup/_components/SignupForm.tsx>)                               |
| `newsletter_view`        | The homepage newsletter block scrolls into view                         | `location` (`"home_after_hero"`)           | [`Newsletter.tsx`](<../app/(new)/_components/Newsletter.tsx>)                                      |
| `acceleration_cta_click` | User clicks any 頂讓加速包 (acceleration package) CTA                   | `plan`                                     | See CTA table below                                                                                |

> Conversion events (`store_listing_submit`, `sign_up`) fire **only on success**,
> so failed or invalid attempts are not counted.

### `sell_cta_click` — `cta_location` values

| `cta_location`         | Placement                         | Component                                                                               |
| ---------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| `nav`                  | Nav bar "＋ 限時免費刊登" button  | [`SellButton.tsx`](<../app/(new)/_components/SellButton.tsx>)                           |
| `hero`                 | Homepage hero "立即免費刊登" link | [`HeroSplit/index.tsx`](<../app/(new)/_components/HeroSplit/index.tsx>)                 |
| `seller_cta_section`   | "搶早鳥免費刊登" section button   | [`SellerCta.tsx`](<../app/(new)/_components/SellerCta.tsx>)                             |
| `store_example_banner` | Store-example page banner link    | [`ExampleBanner.tsx`](<../app/(new)/store-example/_components/ExampleBanner.tsx>)       |
| `my_listings_empty`    | My-listings empty-state link      | [`MyListingsContent.tsx`](<../app/(new)/my-listings/_components/MyListingsContent.tsx>) |

Plain-link CTAs use the shared [`SellCtaLink`](<../app/(new)/_components/SellCtaLink.tsx>)
component (NextLink + `trackEvent`). The two auth-branching buttons
(`SellButton`, `SellerCta`) call `trackEvent` inline in their click handlers,
since they route to `/sell` or `/login?redirect=/sell` depending on auth state.

### `acceleration_cta_click` — `plan` values

Fired by every CTA in the seller-facing 頂讓加速包 (acceleration package) flow.
The `plan` param records **which button** was clicked; every CTA opens the same
Google Form (`ACCELERATION_FORM_URL`), so `plan` is the only signal of intent.

| `plan`   | Placement                                                  | Component                                                                                 |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `banner` | My-listings banner "查看加速方案" link (→ `/acceleration`) | [`AccelerationBanner.tsx`](<../app/(new)/my-listings/_components/AccelerationBanner.tsx>) |
| `hero`   | `/acceleration` hero "查看加速方案" button (→ Google Form) | [`HeroPromo.tsx`](<../app/(new)/acceleration/_components/HeroPromo.tsx>)                  |
| `basic`  | 基礎加速包 card "選擇基礎方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |
| `hot`    | 熱門加速包 card "選擇熱門方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |
| `urgent` | 急售加速包 card "選擇急售方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |

> The `banner` CTA navigates to the `/acceleration` page (not the form); the
> `hero` / `basic` / `hot` / `urgent` CTAs open the Google Form in a new tab via
> the shared [`AccelerationCta`](<../app/(new)/acceleration/_components/AccelerationCta.tsx>)
> component. Because the form is one shared link, `plan` is how you distinguish
> "clicked the banner" from "clicked the 熱門 plan" in GA4.

---

## Adding a new event

1. Call `trackEvent("event_name", { ...params })` from a client component,
   ideally at the point the action **succeeds** (not on raw click) for
   conversions.
2. Use `snake_case` event and parameter names.
3. Add a row to the reference table above.

---

## Dev / prod separation

Both environments share one measurement ID. Dev vs prod is separated **in GA4
reports** using the built-in **Hostname** dimension:

- `hostname = localhost` → development
- `hostname = <your domain>` → production

Add a report comparison/filter on Hostname (exclude `localhost` to see prod
only). No code or env changes are required for this.

---

## GA4 console setup (not code)

- **Key events (重要活動):** mark `sign_up` and `store_listing_submit` as key
  events (Admin → Key events) so they count as conversions.
- **Custom dimensions:** to break reports down by `cta_location`, `plan`,
  `category`, or `city`, register each as an event-scoped custom dimension
  (Admin → Custom definitions). Events still record without this; the params
  just won't be available as report dimensions until registered.
- **DebugView:** use Admin → DebugView (or the Realtime report) to confirm event
  names and parameters arrive exactly as expected.
