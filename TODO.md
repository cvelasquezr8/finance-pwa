# Finance PWA — TODO & Known Issues

> Last updated: 2026-05-29
> Branch: `feat/nextjs-migration`

Tracking list of bugs, missing pieces, and follow-up work discovered during the
Vite → Next.js App Router migration and the UI polish pass. Ordered by priority.

---

## 🔴 Bugs (broken / failing)

### 1. Missing PWA manifest & icons → `GET /manifest.webmanifest` returns 500
- **What:** `src/app/layout.tsx` declares `manifest: '/manifest.webmanifest'` but
  `public/` is empty — no manifest file, no app icons.
- **Impact:** 500 error on every page load; PWA install is not possible.
- **Fix:** Create `public/manifest.webmanifest` (name, short_name, theme_color
  `#1c1917`, background, display `standalone`, start_url `/`) and add icon set
  (192×192, 512×512, maskable). Reference them in the manifest.
- **Files:** `public/manifest.webmanifest`, `public/icons/*`

### 2. `api-config` unit tests reference stale `VITE_*` env vars (2 failing tests)
- **What:** `tests/unit/api-config.test.ts` stubs `VITE_API_HOST` / `VITE_FORCE_MOCK`,
  but `src/services/api-config.ts` now reads `NEXT_PUBLIC_API_HOST` /
  `NEXT_PUBLIC_FORCE_MOCK` (changed during the Next.js migration).
- **Impact:** 2 tests fail permanently:
  - `uses real API when VITE_API_HOST is provided`
  - `strips trailing slashes from the host`
- **Fix:** Update the test to stub `NEXT_PUBLIC_*`. Note: `api-config.ts` captures
  the env vars in module-level constants at import time, so the test's
  `vi.resetModules()` + re-import pattern must set the env BEFORE the dynamic import
  (it already does — only the variable names are wrong).
- **Files:** `tests/unit/api-config.test.ts`

---

## 🟡 Missing / incomplete

### 3. Geist Mono font not installed → headings fall back to monospace
- **What:** During the `next/font` migration the `geist` npm package was found to
  be absent, so `GeistMono` was omitted from `layout.tsx`. Headings (`--font-heading`)
  currently fall back to the generic `monospace`.
- **Fix:** `npm install geist`, then re-enable the `localFont` block in
  `src/app/layout.tsx` and add `${geistMono.variable}` back to the `<html>` className.
- **Files:** `src/app/layout.tsx`, `package.json`

### 4. Branch not merged
- **What:** All session work lives on `feat/nextjs-migration`. Not merged to `master`.
- **Fix:** When ready, merge or open a PR. Run full test suite first (note the 2
  known `api-config` failures above — fix #2 before merging for a green suite).

---

## 🟢 Verification / polish (nice-to-have)

### 5. Manual responsive QA across breakpoints
- **What:** DataTables (transactions, history, admin) were reworked to never show a
  horizontal scrollbar — they hide lower-priority columns at `md`, reveal all at `lg`,
  and fall back to card layout below `md`. SummaryCards auto-shrink to fit.
- **Action:** Manually verify at 375px (mobile), 768px (tablet), 1280px (desktop) that:
  - No table overflows horizontally
  - Card layouts render below `md`
  - Currency amounts never escape their card/cell
  - Quincena pills show `Q1/Q2` on mobile

### 6. Optimistic updates for transaction mutations (deferred from UI polish plan)
- **What:** The original UI polish spec proposed optimistic `onMutate` cache updates
  with a pending amber-border state on new rows. This was descoped during execution.
- **Action:** Wire `onMutate` / `onError` rollback / `onSettled` refetch in
  `useTransactionsQuery` mutations if instant feedback is desired.
- **Files:** `src/modules/transactions/hooks/useTransactions.ts`

### 7. `en.json` translation review
- **What:** `en.json` has full key parity with `es.json` (381 keys each), but English
  copy was auto-added for newer keys (e.g. `debitHint`). 
- **Action:** Have a native/fluent reviewer proofread English strings if the app
  ships in English.

---

## ✅ Done this session (for reference)

- Route group conflict fixed (`(auth)/page` → `(auth)/auth/page` = `/auth`)
- `localStorage` SSR crash guarded in `src/i18n/index.ts`
- `.next/` added to `.gitignore`, build artifacts untracked
- Full UI polish: shimmer skeletons, count-up, stagger, amber accents, page
  transitions, hover prefetch, BottomBar sliding pill, ISO card tiles
- Dashboard migrated to `useSuspenseQuery` + Suspense boundaries
- Responsive fixes: stat-bar grid, auto-fit currency font, `text-wrap: balance`
- Unified card selector (debit + credit) — debit cards now selectable; `isCC`
  derived from card type at submit
- DataTables fill viewport with no horizontal scroll; refined header typography
