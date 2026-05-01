# Admin Authentication & User Management

## Overview

This session added a full admin authentication system to the Bezold project, including login, route protection, user role management, and code quality improvements.

---

## What Was Built

### 1. Firebase Auth Setup

**`firebase/client.ts`**
- Added `getAuth` and exported `auth` for client-side Firebase Auth

**`firebase/server.ts`**
- Added `getAuth` and exported `adminAuth` for server-side Firebase Admin Auth

---

### 2. Admin Login Page

**`app/admin/login/page.tsx`**
- Ant Design card UI with email + password inputs
- After sign-in, checks `token.claims.admin` — non-admin users are signed out immediately with an "Access denied" notification
- Redirects to `/admin/store/list` on successful admin login

**`app/admin/page.tsx`**
- Updated to redirect `/admin` → `/admin/login` via Next.js `redirect()`

---

### 3. Route Protection

**`app/admin/AdminAuthGuard.tsx`**
- Client component wrapping all admin routes
- Uses `useAdminAuth` hook to check auth state
- Shows `<Spin />` loader while auth resolves (replaces blank flash)
- Redirects unauthenticated or non-admin users to `/admin/login`

**`app/admin/layout.tsx`**
- Wraps all admin children with `AdminAuthGuard`
- Passes `<AdminUserBadge />` to the header's `rightSlot`

---

### 4. Admin Header Badge

**`components/AdminUserBadge.tsx`**
- Shows logged-in admin's email in the top-right header
- Only renders when user has `admin: true` claim
- Includes a Logout button that signs out and redirects to login

**`components/Header.tsx`**
- Added `rightSlot?: React.ReactNode` prop to support injecting content into the header

---

### 5. User Role Management

**`app/admin/users/page.tsx`**
- Table listing all Firebase Auth users with their email, UID, and role
- Ant Design `Switch` to grant/revoke `admin` claim per user
- Uses `useAdminAuth` for the ID token

**`app/admin/users/layout.tsx`**
- Wraps the users page with `AdminSidebar`

**`components/AdminSidebar.tsx`**
- Extracted shared sidebar used across all admin layouts
- Contains Store Management and User Management menu groups

**`app/admin/store/layout.tsx`**
- Refactored to use `AdminSidebar` instead of inline menu

---

### 6. API Routes

**`app/api/admin/users/route.ts`** — `GET`
- Lists all Firebase Auth users with their admin claim status
- Protected by caller's ID token (must have `admin: true`)

**`app/api/admin/set-claim/route.ts`** — `POST`
- Sets or revokes `admin: true` custom claim on a given UID
- Protected by caller's ID token
- Accepts `{ uid: string, admin: boolean }`

---

### 7. Shared Utilities

**`lib/verifyAdminToken.ts`**
- Shared helper used by both API routes
- Verifies the Bearer token and checks the `admin` claim
- Wraps Firebase errors in clean HTTP responses

**`hooks/useAdminAuth.ts`**
- Single `onAuthStateChanged` listener returning `{ user, isAdmin, loading, idToken }`
- Used by `AdminAuthGuard`, `AdminUserBadge`, and `users/page.tsx` to avoid duplicate Firebase listeners

---

### 8. Code Quality

- Extracted `useAdminAuth` hook to centralise auth state (previously duplicated across components)
- Extracted `verifyAdminToken` helper to deduplicate API route auth checks
- Added try/catch error boundaries to all admin API routes
- Replaced null flash in `AdminAuthGuard` with loading spinner

---

### 9. Tooling

**`.claude/settings.json`**
- Added `PostToolUse` hook that runs `prettier --write` automatically after every file write or edit

**`.gitignore`**
- Added `.claude/settings.local.json` to prevent personal Claude Code overrides from being committed

---

## Auth Flow Diagram

```
User visits /admin/*
      │
      ▼
AdminAuthGuard (loading spinner)
      │
      ├── not authenticated → redirect /admin/login
      ├── authenticated, no admin claim → redirect /admin/login + "Access denied" notification
      └── authenticated + admin claim → render page
```

## Granting Admin Access

To grant a user admin access, call the set-claim endpoint with an existing admin's ID token:

```bash
curl -X POST http://localhost:3000/api/admin/set-claim \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_ID_TOKEN>" \
  -d '{"uid": "TARGET_USER_UID", "admin": true}'
```

Or toggle it directly from the `/admin/users` page in the UI.
