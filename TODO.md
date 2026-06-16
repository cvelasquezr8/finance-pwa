# Finance PWA — TODO & Known Issues

> Last updated: 2026-06-15
> Branch: `feat/nextjs-migration`

Tracking list of bugs, missing pieces, and follow-up work discovered during the
Vite → Next.js App Router migration and the UI polish pass. Ordered by priority.

---

## 🟡 Missing / incomplete

### 4. Branch not merged
- **What:** All session work lives on `feat/nextjs-migration`. Not merged to `master`.
- **Fix:** When ready, merge or open a PR. Suite is green (`npm run lint && npm run test`
  pass; `npm run build` OK).

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

## ✅ Done — 2026-06-15 review pass

- **PWA fixed:** created `public/manifest.webmanifest` + SVG icons (`public/icons/`,
  `public/favicon.svg`); icon metadata wired in `layout.tsx`. Manifest no longer 404s.
- **Geist Mono wired:** installed `geist`, `GeistMono` in `layout.tsx`, `--font-heading`
  → `var(--font-geist-mono)`, tailwind fonts via CSS variables. (Found the `.theme` block
  was dead, so headings weren't even falling back to monospace.)
- **Tests fixed:** `api-config.test.ts` stubs now `NEXT_PUBLIC_*` (was `VITE_*`).
- **Playwright fixed:** `webServer` → `next build && next start` on port 3000 (was Vite `preview`).
- **Vite cleanup:** removed `vite-plugin-pwa` + unused `@fontsource/*`; deleted `dist/`;
  `tsconfig.node.json` no longer references `vite.config.ts`. (`vite`/`@vitejs/plugin-react`
  kept — Vitest needs them.)
- **Docs updated to Next.js:** `README.md`, `CODING_STANDARDS.md`, `claude.md` (rules
  realigned to code: client-first, file-naming by export, CC expiry-slash marked as a
  pending feature).
- **CC balance bug:** `MockAdapter.computeBalance` now excludes `isCC` from
  `initialBalance`/`projectedBalance` (cash-only sums).
- **Zod schemas centralized:** `editTransactionSchema`, `incomeSchema`, `profileSchema`
  moved out of components; `cardId↔isCC` refinement added.
- **`text-[10px]` → `text-2xs`** design token across components.
- **Auth hardening:** SSR-guarded `localStorage` in `BaseApiService`; **fixed** 401
  redirect `/login` → `/auth` (`/login` didn't exist).

### Still open / new follow-ups
- Add `<DialogDescription>` to modals (Radix `aria-describedby` warning, ~12 modals).
- Add the `next` ESLint plugin (`next/core-web-vitals`) to `eslint.config.js`.
- `next lint` deprecates in Next 16 → migrate to ESLint CLI.

---

## ✅ Done — earlier session (for reference)

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
