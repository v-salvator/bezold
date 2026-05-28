# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # start Next.js dev server (port 3000)
npm run build   # production build
npm run lint    # ESLint via next/core-web-vitals
```

No test runner is configured.

## Architecture

**Bezold** is a Next.js 14 (App Router) marketplace for buying/selling startup businesses, targeting Taiwan. TypeScript throughout.

**Stack**: Next.js 14 · TypeScript · Jotai (state) · Tailwind CSS + CSS Modules · Ant Design 5 · Firebase (Firestore, Auth, Storage) · Motion.js

### Route groups

| Group        | Purpose                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| `app/(new)/` | Primary public-facing site (root `/`) — home, browse, store detail, auth, sell, legal, guide  |
| `app/admin/` | Admin dashboard (Firebase custom-claims gating)                                               |
| `app/api/`   | Route handlers (admin auth, stores)                                                           |
| `app/old/`   | Archived previous site — old route groups preserved at `/old/*` for reference, not production |

### Key directories

- `atoms/` — Jotai atoms. `SearchFilterAtom.ts` owns all filter state (`cityAtom`, `tagAtom`, `amountFilterAtom`, `categoryAtom`, composed `filtersAtom`, `activeDrawerCardAtom`).
- `components/refactored/` — Shared design-system primitives (Button, Pill, Card, FormField, StoreCard, SectionTitle, Category, Link, Dropdown). Each has a co-located `*.module.css`. **Before building any UI for a new route, check here first for reusable primitives.** When a new component built inside a route is generic enough (no route-specific logic or data), extract it here so future routes can reuse it.
- `components/home/`, `components/animated/`, `components/SearchFilter/` — Feature-specific component groups.
- `firebase/client.ts` — exports `db`, `storage`, `auth` (browser SDK).
- `firebase/server.ts` — exports `db`, `bucket`, `adminAuth` (Admin SDK, server-only).
- `hooks/` — `useAdminAuth` (Firebase auth + admin token), `useCategoryKey`, `useAdminMenuKey`.
- `types/` — `Store`, `StoreDoc`, `User`, `StoreTag`, `StoreCategory`, `StoreStatus` interfaces.
- `utils/className.ts` and `lib/utils.ts` — both export `cn()` (clsx + tailwind-merge). Prefer `@/lib/utils`.
- `mocks/` — Mockaroo-generated mock data for development.

### Firebase collections

Environment variables switch between dev and prod Firestore collections (`mockStore`/`mockUser` vs `prodStore`/`prodUser`). Never hardcode collection names — use the env-driven constants.

Queries that combine `where("field", "==", value)` with `orderBy("otherField")` require a **composite Firestore index**. If one is missing, Firestore logs an error with a direct link to create it in the console.

### Firebase Storage images

Images in Firestore are stored as raw Storage paths (e.g. `mockStore/{storeId}/1.png`), **not** download URLs.

- **Client components**: resolve with `getDownloadURL(ref(storage, path))` from `firebase/storage` before passing to `<Image src>`. Passing the raw path directly causes a `next/image` parse error.
- **Server components**: use `getImagesByPath()` from `firebase/serverUtils/image.ts`, which resolves via Admin SDK signed URLs.

### Firestore write constraints

`updateDoc` rejects `undefined` values — Firestore will throw at runtime if any field is `undefined`. Always pass `""` for optional string fields that are empty, never `field || undefined`.

## Styling rules

**CSS Modules handle paint; Tailwind handles layout — never mix both on the same element.**

- If a JSX element has a `styles.xxx` class, all its visual styles go in the CSS module. Do not add Tailwind utilities alongside it.
- Tailwind may be used freely on elements that carry no CSS module class (plain layout wrappers, spacing divs, responsive containers).
- Use CSS nesting syntax (`& .child`, `&.modifier`) — all existing modules already do this.
- CSS variable tokens (`--ink`, `--paper`, `--accent`, `--hand`, `--display`, `--mono`) are defined on the root wrapper div and cascade to all children — reference via `var(--token)`, never redefine per component.
- The `app/(new)/` route group defines an extended token set in `app/(new)/layout.module.css`: `--ink-2`, `--paper-2`, `--paper-3`, `--accent-2`, `--accent-3`, `--muted`, `--note`, `--brand`. Use these when building any page under `app/(new)/`.
- Never use `overflow: hidden` on a container that holds `<Dropdown>` or any other absolutely-positioned menu — the menu will be clipped. Apply `border-radius` to the child elements directly instead.
- When a CSS module class is applied to an `<a>` element, always add `text-decoration: none; color: inherit` to that class — browser link defaults otherwise override the design system styles.

## Component conventions

- **Page-level sections** → `app/<route>/_components/ComponentName.tsx` + co-located `ComponentName.module.css`. For complex sections use a folder: `ComponentName/index.tsx` + `ComponentName/ComponentName.module.css`.
- **Sub-components** (FaqItem, Step, WhyUsItem, etc.) go at the bottom of the parent file unless reused elsewhere or the file becomes hard to navigate.
- Use `cn()` from `@/lib/utils` for all conditional class name composition — never string template literals.
- Ant Design is configured with primary color `#ff4a31` via `ConfigProvider` in the root layout.
- **Optionally-clickable primitives** — shared components that are sometimes links and sometimes static accept `href?: string` and render as `<a>` when provided, `<div>` otherwise. See `Category.tsx` and the `District` sub-component in `Districts.tsx` for the established pattern.

### Page shell pattern

Every page under `app/(new)/` follows this structure:

```tsx
<>
  <LaunchBanner />
  <SiteNav activeLink="頁面名稱" /> {/* label must match navLinks exactly */}
  <div className="flex-1">
    <SectionA />
    <SectionB />
    ...
  </div>
  <SiteFooter />
</>
```

- Pass `activeLink` matching the **exact label string** from the `navLinks` array in `SiteNav.tsx` — this highlights the current page.
- The inner wrapper must be `<div className="flex-1">` (or omitted entirely) — **never** wrap sections in a `max-width` constrained frame div. The `Section` component handles its own full-width background colors; a constrained wrapper causes dark/alt sections to render as floating boxes instead of full-width bands.

### Search filter state pattern

URL params are the source of truth for filter state in `/store-list`. Two rules:

1. **Navigation into store-list** — always build a `URLSearchParams` object and call `router.push('/store-list?...')`. Never write to Jotai atoms cross-page. Supported params: `city`, `category`, `tag`, `amountMin`, `amountMax`.

2. **SearchBar hydration** — `SearchBar.tsx` runs a `useEffect([], [])` on mount that reads `useSearchParams()` and sets `cityAtom`, `tagAtom`, `categoryAtom`, `amountFilterAtom` so the dropdowns reflect the current URL. This must be preserved whenever SearchBar is modified.
