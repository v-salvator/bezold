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

| Group                     | Purpose                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `app/(LayoutWithBasic)/`  | Main marketplace pages (home, browse, store detail)                                   |
| `app/(LayoutWithNav)/`    | Pages with persistent nav bar                                                         |
| `app/(LayoutWithoutNav)/` | Minimal layout (auth, onboarding)                                                     |
| `app/admin/`              | Admin dashboard (Firebase custom-claims gating)                                       |
| `app/new/`                | Redesigned public-facing site — auth, store browse, store detail, seller listing form |
| `app/api/`                | Route handlers (admin auth, stores)                                                   |

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

### Firestore write constraints

`updateDoc` rejects `undefined` values — Firestore will throw at runtime if any field is `undefined`. Always pass `""` for optional string fields that are empty, never `field || undefined`.

## Styling rules

**CSS Modules handle paint; Tailwind handles layout — never mix both on the same element.**

- If a JSX element has a `styles.xxx` class, all its visual styles go in the CSS module. Do not add Tailwind utilities alongside it.
- Tailwind may be used freely on elements that carry no CSS module class (plain layout wrappers, spacing divs, responsive containers).
- Use CSS nesting syntax (`& .child`, `&.modifier`) — all existing modules already do this.
- CSS variable tokens (`--ink`, `--paper`, `--accent`, `--hand`, `--display`, `--mono`) are defined on the root wrapper div and cascade to all children — reference via `var(--token)`, never redefine per component.
- The `/new` route defines an extended token set in `app/new/layout.module.css`: `--ink-2`, `--paper-2`, `--paper-3`, `--accent-2`, `--accent-3`, `--muted`, `--note`, `--brand`. Use these when building any page under `app/new/`.

## Component conventions

- **Page-level sections** → `app/<route>/_components/ComponentName.tsx` + co-located `ComponentName.module.css`. For complex sections use a folder: `ComponentName/index.tsx` + `ComponentName/ComponentName.module.css`.
- **Sub-components** (FaqItem, Step, WhyUsItem, etc.) go at the bottom of the parent file unless reused elsewhere or the file becomes hard to navigate.
- Use `cn()` from `@/lib/utils` for all conditional class name composition — never string template literals.
- Ant Design is configured with primary color `#ff4a31` via `ConfigProvider` in the root layout.
