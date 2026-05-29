# Finance PWA — UI/UX Improvement Design

**Date:** 2026-05-29
**Branch:** feat/nextjs-migration
**Approach:** Option B — Motion + Polish Layer

## Goals

Apply a premium polish layer across the entire Finance PWA without structural rewrites. Priorities in order:

1. **Premium feel** — micro-animations, smooth transitions, refined spacing
2. **Perceived performance** — shimmer skeletons, optimistic updates, Suspense boundaries
3. **Balanced coverage** — every page and both breakpoints improved equally
4. **Amber expressiveness** — promote the amber accent from a subtle hint to a genuine hero color

---

## Section 1: Motion & Micro-animation System

### Entry Animations
- All cards, list items, and modals mount with `fade-in + slide-up` (8px vertical, 200ms ease-out)
- Grid children (SummaryCards, EventCards) receive staggered `animation-delay` (0ms, 60ms, 120ms, 180ms) so they appear sequentially
- Implementation: CSS keyframes in `globals.css`, applied via Tailwind utility classes

### Number Counters on SummaryCards
- Balance figures animate from 0 to real value on mount and on every filter change
- Implementation: lightweight `useCountUp(target, duration)` hook using `requestAnimationFrame` — increments a local `value` state from 0 to `target` over 600ms with an ease-out curve, then formats via the existing `formatCurrency` util
- Hook resets and replays whenever `target` changes (i.e. on filter change)
- No external library needed; ~25 lines of hook code

### BottomBar Active Pill
- An absolutely-positioned amber pill slides under the active icon using CSS `translate`
- State tracked via `usePathname()` — pill position derived from active index
- Transition: `transition-transform duration-300 ease-out`

### Sidebar Hover Micro-interactions
- Nav link items: `hover:translate-x-0.5 transition-transform duration-150`
- Active icon badge: `scale-110` with `transition-transform duration-150`
- Both are CSS-only, no JS event handlers

### Page Transition
- `(protected)/layout.tsx` wraps `{children}` in a `<div key={pathname}>` with a `animate-fade-in-up` class
- `pathname` from `usePathname()` acts as the React key, triggering remount + animation on route change
- Animation: 150ms opacity + 6px translateY — fast enough to feel snappy, visible enough to feel premium

### Button Press States
- All `<Button>` variants and interactive card elements get `active:scale-[0.97] transition-transform duration-75`
- Applied globally via the Button component's base className

### New keyframes in `globals.css`
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
@property --num {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}
```

---

## Section 2: Skeleton & Perceived Performance

### Shimmer Skeleton Component
- Install/verify `components/ui/skeleton.tsx` (Shadcn skeleton)
- Override default pulse animation with `shimmer` keyframe:
  `background: linear-gradient(90deg, muted 25%, muted-foreground/10 50%, muted 75%)`
  `background-size: 200% 100%; animation: shimmer 1.5s infinite`
- Single source of truth — all skeletons use `<Skeleton className="..." />`

### Purpose-built Skeletons
- **SummaryCards**: 4-card grid, each with label bar (w-24 h-3) + value bar (w-32 h-7) + subtitle bar (w-20 h-3)
- **BalanceTrendChart**: Full-height shimmer rectangle with 4 thin `border-b` stripes at 25% intervals suggesting axis lines
- **CategorySpendingChart**: Shimmer rectangle + 3 shimmer legend-pill rows below
- **QuickDailyList**: 5 shimmer rows, each with left text bar (w-36) + right amount bar (w-16), matching real list rhythm
- **TransactionTable**: Shimmer rows matching column widths of the real table

### Suspense Boundaries
- Migrate dashboard data hooks from `useQuery` to `useSuspenseQuery` (TanStack Query v5) so they participate in React Suspense
- Wrap each major dashboard section in `<Suspense fallback={<MatchingSkeleton />}>`:
  - `<SummaryCards>` — own Suspense
  - `<BalanceTrendChart>` — own Suspense
  - `<CategorySpendingChart>` — own Suspense
  - `<QuickDailyList>` — own Suspense
- Sections reveal independently; no all-or-nothing flash
- Non-dashboard pages keep `useQuery` + manual `isLoading` checks (lower complexity, lower traffic)

### Optimistic Updates on Transaction Submit
- In `AddTransactionModal` / `AddDailyExpenseModal`: use TanStack Query `onMutate` to:
  1. Cancel in-flight queries for the affected key
  2. Snapshot current data
  3. Inject the new item with `status: 'pending'` into the cache
  4. On `onError`: rollback to snapshot
  5. On `onSettled`: refetch to sync with server
- Pending items render with a faint amber left-border pulse (`border-l-2 border-primary/50 animate-pulse`)

---

## Section 3: Amber Accent & Visual Hierarchy

### SummaryCards Hero Treatment
- "Current Balance" card: `bg-gradient-to-br from-primary/8 to-transparent` background (dark: `from-primary/12`)
- Value text: `text-3xl font-bold text-primary` (amber in dark, charcoal in light)
- Other three cards: unchanged neutral style
- Creates single focal point; hierarchy: 1 hero + 3 supporting

### Chart Fill Colors
- Replace hardcoded `#f59e0b` with `hsl(var(--primary))`
- Expense area: `hsl(var(--muted-foreground) / 0.25)`
- Both charts (`BalanceTrendChart`, `CategorySpendingChart`) updated consistently

### Page Header Accent
- Mobile (`lg:hidden`): `<h1>` wrapped in `<div className="border-l-2 border-primary pl-3">`
- Desktop: standard left-aligned heading (sidebar provides enough branding context)
- Applied to: Dashboard, Transactions, Cards, Events, Analytics, History, Admin

### Interactive Card Hover
- All clickable cards: `hover:border-primary/30 transition-colors duration-200`
- Affects: EventCard, transaction rows, MyCardsPage card tiles
- Subtle amber reveal on hover — communicates interactivity without being distracting

### Empty States
- Each page's "no data" state gets:
  - Centered `<div className="rounded-full bg-primary/10 p-4 mb-3">` with a relevant Lucide icon in `text-primary`
  - Heading in `font-medium` + `text-muted-foreground` description below
- Affected: QuickDailyList, TransactionTable, EventsPage, HistoryPage, MyCardsPage

### Event Status Badge Enhancement
- Status chips on EventCard: add `border-l-2` in matching status color
  - ACTIVE: `border-l-success`
  - COMPLETED: `border-l-primary`
  - CANCELLED: `border-l-destructive`

---

## Section 4: Page-by-Page Improvements

### Dashboard
- SummaryCards re-animate (stagger) on every filter change, not just initial mount — achieved by keying the grid on `filter.month + filter.quincena`
- MonthFilter Quincena toggle: replace the quincena dropdown with a 2-option pill toggle (Q1 / Q2) with a sliding amber indicator; month and year selectors remain unchanged
- Desktop layout: sticky right column with `border-l border-border ml-6 pl-6` separator

### Transactions
- FilterBar: group MonthFilter + card Select inside `<div className="bg-card border rounded-xl p-2 flex flex-wrap gap-2">`
- Transaction rows: `hover:bg-accent/50` + `hover:border-l-2 hover:border-primary/40`
- Totals summary: compact `3-column inline stat bar` (Scheduled | Daily | Income) with `divide-x divide-border`, replacing card-per-stat layout — saves ~80px vertical space on mobile

### Cards (MyCardsPage)
- Each card rendered as `aspect-[85.6/54]` tile (ISO 7810 ID-1 ratio)
- CREDIT type: `bg-gradient-to-br from-amber-600 to-amber-900` (dark) / `from-amber-400 to-amber-700` (light)
- DEBIT type: `bg-gradient-to-br from-stone-700 to-stone-900` (dark) / `from-stone-500 to-stone-700` (light)
- Card number: `•••• •••• •••• {last4}` in monospace (`font-mono`)
- Chip icon: small `CreditCard` Lucide icon, top-left
- Expiry: bottom-right, `MM/YY` format — **slash is preserved as-is per CLAUDE.md sanitization rule**

### Events
- EventCard: stagger entry animation (60ms delay per card)
- Progress bar: `transition-[width] duration-700 ease-out` on mount
- Deadline badge: pulses amber (`animate-pulse text-amber-500`) if `deadline` is within 7 days of today

### Analytics & History
- Chart sections: consistent shimmer skeleton at exact component height
- History table: `even:bg-muted/30` zebra striping; column widths pinned with `min-w-[...]` to prevent layout shift

### Mobile BottomBar
- Active state: amber pill slides under icon (`translate-x` driven by active index)
- Active icon: `scale-110 drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]`
- All transitions: `duration-300 ease-out`

---

## Section 5: Performance & Code Quality

### `'use client'` Audit
Add directive to every component that uses hooks or context, making the server/client boundary explicit:
- All module page components (DashboardPage, TransactionsPage, EventDetailPage, etc.)
- All layout components (AppLayout, Sidebar, BottomBar, MobileHeader, MonthFilter, FAB)
- All modal components

### TanStack Query Hover Prefetch
- BottomBar and Sidebar nav links: on `onMouseEnter`, call `queryClient.prefetchQuery(routePrimaryQueryKey)` + `router.prefetch(href)` in parallel
- Nav components don't have filter state — prefetch uses the **current calendar period** (computed inline: `{ month: now.getMonth()+1, year: now.getFullYear(), quincena: getQuincena(now) }`)
- Route → query key mapping:
  - `/` → `['dashboard', currentPeriod]`
  - `/transactions` → `['transactions', currentPeriod]`
  - `/events` → `['events']`
  - `/history` → `['history', currentPeriod]`
  - `/cards` → `['cards']`
- This primes the most common case (current period); filter changes on arrival still refetch as normal

### Avatar Image Optimization
- `Sidebar.tsx` and `MobileHeader.tsx`: replace `<img src={user.avatarUrl}>` with `next/image`
- Use `width={36} height={36}` with `className="object-cover rounded-full"`
- Add `unoptimized` prop for external URLs to avoid `next.config` domain whitelist requirement

### Font Loading via `next/font`
- Remove `@import '@fontsource-variable/inter'` and `@import '@fontsource/geist-mono'` from `globals.css`
- Replace with `next/font/local` or `next/font/google` in `app/layout.tsx`
- Apply via CSS variables (`--font-sans`, `--font-heading`) matching existing theme tokens
- Benefit: automatic subsetting, preload link injection, `font-display: swap`, no FOUT

### Recharts SSR Guard
- Confirm all chart components have `'use client'` directive (they do via parent hooks, but make it explicit)
- No dynamic import needed — `'use client'` boundary is sufficient to exclude from server bundle

---

## Files to Create
- `src/components/ui/skeleton.tsx` — shimmer skeleton (install via Shadcn CLI if not present)
- `src/components/layout/FilterBar.tsx` — unified filter toolbar for Transactions page
- `src/lib/hooks/useCountUp.ts` — `requestAnimationFrame`-based count-up hook for SummaryCards

## Files to Modify
- `src/app/globals.css` — add keyframes, `@property`, font variable updates
- `src/app/layout.tsx` — migrate to `next/font`, apply CSS variables
- `src/app/(protected)/layout.tsx` — add keyed page transition wrapper
- `src/components/layout/AppLayout.tsx` — button press states
- `src/components/layout/BottomBar.tsx` — sliding pill, hover prefetch
- `src/components/layout/Sidebar.tsx` — hover micro-interactions, hover prefetch, next/image avatar
- `src/components/layout/MobileHeader.tsx` — next/image avatar
- `src/components/ui/button.tsx` — add `active:scale-[0.97]` to base
- `src/modules/dashboard/components/DashboardPage.tsx` — keyed grid, Suspense boundaries
- `src/modules/dashboard/components/SummaryCards.tsx` — hero card, number counter, shimmer skeleton, stagger
- `src/modules/dashboard/components/BalanceTrendChart.tsx` — hsl colors, shimmer skeleton
- `src/modules/dashboard/components/CategorySpendingChart.tsx` — shimmer skeleton
- `src/modules/dashboard/components/QuickDailyList.tsx` — shimmer skeleton, empty state, amber hover
- `src/modules/transactions/components/TransactionsPage.tsx` — FilterBar, inline stat bar, Suspense
- `src/modules/transactions/components/TransactionTable.tsx` — hover states, zebra, shimmer skeleton, optimistic rows
- `src/modules/transactions/components/AddTransactionModal.tsx` — optimistic update wiring
- `src/modules/transactions/components/AddDailyExpenseModal.tsx` — optimistic update wiring
- `src/modules/cards/components/MyCardsPage.tsx` — ISO card tiles, gradient backgrounds
- `src/modules/events/components/EventsPage.tsx` — stagger animation, empty state
- `src/modules/events/components/EventCard.tsx` — progress bar transition, deadline pulse, amber hover
- `src/modules/notifications/components/NotificationPanel.tsx` — empty state
- `src/modules/admin/components/AdminUsersPage.tsx` — consistent hover/zebra treatment

## Out of Scope
- Design token overhaul (Option C)
- New pages or features
- Backend / API changes
- i18n additions
- Test updates (visual changes don't require new unit tests; existing tests remain valid)
