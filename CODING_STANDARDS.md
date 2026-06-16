# Finance PWA — Coding Standards

> **Purpose:** Any developer joining this project should read this file first.
> It defines every structural, stylistic, and domain rule in effect — and the reason behind each one.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Path Aliases](#2-path-aliases)
3. [Naming Conventions](#3-naming-conventions)
4. [Import Organization](#4-import-organization)
5. [Component Rules](#5-component-rules)
6. [Styling Rules](#6-styling-rules)
7. [Taupe & Amber Theme Reference](#7-taupe--amber-theme-reference)
8. [TypeScript Rules](#8-typescript-rules)
9. [Forms & Zod Validation](#9-forms--zod-validation)
10. [Hooks Architecture](#10-hooks-architecture)
11. [Services Architecture](#11-services-architecture)
12. [Business Domain Rules](#12-business-domain-rules)
13. [i18n Rules](#13-i18n-rules)
14. [Framework: Next.js App Router](#14-framework-nextjs-app-router)
15. [Configuration Files Reference](#15-configuration-files-reference)

---

## 1. Project Architecture

This project follows **Domain-Driven Design (DDD)** with a feature-slice structure.

```
src/
├── components/
│   ├── layout/          # App shell: AppLayout, Sidebar, MobileHeader, BottomBar, FAB
│   └── ui/              # Shadcn/UI primitives — never modify directly
│
├── contexts/            # React Context providers (Auth only)
│
├── core/
│   ├── types/           # Pure TypeScript domain types — no runtime code
│   └── dtos/            # API Data Transfer Objects (request/response shapes)
│
├── i18n/                # i18next configuration + locale files (Spanish-first)
│
├── lib/
│   └── utils.ts         # Pure utility functions and UI constants
│
├── modules/             # Feature slices — each module is self-contained
│   ├── auth/
│   │   ├── components/
│   │   └── schemas/
│   ├── dashboard/
│   │   ├── components/
│   │   └── hooks/
│   └── transactions/
│       ├── components/
│       ├── hooks/
│       └── schemas/
│
└── services/            # API client layer — only place that calls the network
```

**Why DDD slices?**
Grouping by feature (not by type) means all code for a feature lives together. Deleting a feature means deleting one folder. Source: _Domain-Driven Design_ by Eric Evans; also recommended by the React team in [React Docs — File Structure](https://react.dev/learn/thinking-in-react).

---

## 2. Path Aliases

The `@` alias is configured in `tsconfig.json` (`paths`) and mirrored in `vitest.config.ts` for tests. It resolves to `./src`.

| Alias          | Resolves to       |
| -------------- | ----------------- |
| `@/components` | `src/components/` |
| `@/lib`        | `src/lib/`        |
| `@/modules`    | `src/modules/`    |
| `@/core`       | `src/core/`       |
| `@/services`   | `src/services/`   |
| `@/contexts`   | `src/contexts/`   |
| `@/i18n`       | `src/i18n/`       |

**Rule:** Always use `@/` aliases for internal imports. Never use deep relative paths like `../../../lib/utils`.

> **Note:** A legacy `lib/` folder may exist at the **project root** (not `src/lib/`) left over from the migration. It is outside `src/` and NOT reachable via `@/`. All current code lives under `src/`; use `@/lib/*` (i.e. `src/lib/`), never the root `lib/`.

---

## 3. Naming Conventions

| Entity              | Convention                | Example                                    |
| ------------------- | ------------------------- | ------------------------------------------ |
| Component files     | PascalCase (match export) | `MobileHeader.tsx`, `TransactionTable.tsx` |
| Hook files          | camelCase (match export)  | `useTransactions.ts`, `useDashboard.ts`    |
| Service files       | PascalCase (match export) | `TransactionService.ts`                    |
| Schema files        | camelCase (match export)  | `transactionSchemas.ts`, `authSchemas.ts`  |
| Plain util / config | kebab-case / lowercase    | `api-config.ts`, `utils.ts`, `idempotency.ts` |
| Components          | PascalCase                | `MobileHeader`, `TransactionTable`         |
| Hooks               | `use` + PascalCase        | `useTransactions`, `useDashboard`          |
| Services            | PascalCase + `Service`    | `TransactionService`                       |
| Context providers   | PascalCase + `Provider`   | `AuthProvider`                             |
| Types / Interfaces  | PascalCase, no `I` prefix | `Transaction`, `BalanceSummary`            |
| DTOs                | PascalCase + `DTO`        | `CreateTransactionDTO`                     |
| Constants           | UPPER_SNAKE_CASE          | `CATEGORY_LABELS`, `MONTHS`                |
| Zod schemas         | camelCase + `Schema`      | `dailyExpenseSchema`                       |
| Inferred form types | PascalCase + `FormValues` | `DailyExpenseFormValues`                   |

**Why no `I` prefix for interfaces?** TypeScript itself dropped this convention. Source: [TypeScript Coding Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines#names).

---

## 4. Import Organization

Imports must be in this order, separated by a blank line between groups:

```ts
// 1. React (always first)
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

// 2. Third-party libraries (alphabetical)
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

// 3. Internal aliases — ONE import statement per module path
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, getQuincenaDateRangeLabel, CATEGORY_LABELS } from '@/lib/utils'
import type { Transaction } from '@/core/types'

// 4. Relative imports (same module, sibling files)
import { EditTransactionModal } from './EditTransactionModal'
```

**Rules:**

- Never split imports from the same module across multiple `import` statements. Merge them.
- Use `import type { ... }` for type-only imports. This is enforced by `isolatedModules: true` in `tsconfig.json` and produces smaller bundles.
- `react` is always the first import in any component file.

**Source:** [Google TypeScript Style Guide — Import Ordering](https://google.github.io/styleguide/tsguide.html#import-type).

---

## 5. Component Rules

### Named exports only

```ts
// ✅ Correct
export function TransactionTable({ ... }: Props) { ... }

// ❌ Wrong
export default function TransactionTable() { ... }
```

Default exports make refactoring harder (the import name can drift from the export name). Source: [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react#naming).

### Internal component order

```tsx
// 1. Types and interfaces at the top
interface Props { ... }
interface RowActions { ... }

// 2. Non-exported sub-components before the main export
function SkeletonRow({ cols }: { cols: number }) { ... }
function MobileRow({ ... }: MobileRowProps) { ... }

// 3. Main exported component last
export function TransactionTable({ ... }: Props) {
  // a. Hook calls (useTranslation, useAuth, useState, useReducer)
  // b. Derived / computed values
  // c. Event handlers and callbacks
  // d. JSX return
}
```

### Shadcn First

Before creating a custom UI component, check `src/components/ui/`. If the required component is not there, install it via the CLI — do not hand-roll primitives.

```bash
npx shadcn@latest add <component-name>
```

Source: [Shadcn/UI — Installation](https://ui.shadcn.com/docs/installation).

### Responsive: mobile-first

All layout decisions start at mobile and expand upward with `md:` and `lg:` breakpoints. The app targets mobile PWA as the primary experience.

```tsx
// ✅ Mobile-first
<div className="block md:hidden">   {/* mobile only */}
<div className="hidden md:block">   {/* desktop only */}
```

---

## 6. Styling Rules

| Rule                                    | Reason                                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No custom CSS                           | Tailwind utility classes cover all use cases; custom CSS creates a parallel system that breaks at refactor time                                                                |
| Use `cn()` for conditional classes      | Merges Tailwind classes safely via `tailwind-merge`, prevents specificity conflicts. Source: [Shadcn/UI — cn utility](https://ui.shadcn.com/docs/installation#add-a-cn-helper) |
| Use CSS variable tokens, not raw colors | `bg-primary`, `text-muted-foreground` etc. inherit the active theme automatically. Hardcoded values break in dark mode.                                                        |
| Semantic color exceptions               | `text-emerald-600` for income and `text-red-600` for expenses are acceptable — they carry domain meaning that shouldn't be abstracted away                                     |
| Amber CC badge                          | `isCC` transactions always render an amber "TC" badge: `bg-amber-500/20 text-amber-600 dark:text-amber-400`                                                                    |
| Font classes                            | Body text: `font-sans` (Inter). Numbers / amounts: `font-heading` (Geist Mono). Headings inherit Geist Mono via the global `h1–h6` rule in `src/app/globals.css`.                    |

---

## 7. Taupe & Amber Theme Reference

Theme is defined in `src/app/globals.css`. All values are HSL tuples consumed via `hsl(var(--token))` in `tailwind.config.js`.

### Core tokens

| Token                  | Light mode                | Dark mode                | Purpose                           |
| ---------------------- | ------------------------- | ------------------------ | --------------------------------- |
| `--background`         | `30 25% 96%`              | `20 11% 10%`             | Page canvas                       |
| `--foreground`         | `20 14% 11%`              | `30 18% 93%`             | Body text                         |
| `--card`               | `30 33% 99%`              | `20 11% 14%`             | Card / modal surfaces             |
| `--primary`            | `20 14% 12%` (deep taupe) | `38 92% 50%` (Amber 500) | CTA buttons, active nav, avatars  |
| `--primary-foreground` | `30 25% 96%`              | `20 11% 10%`             | Text on primary                   |
| `--ring`               | `38 92% 50%`              | `38 92% 50%`             | Focus rings — amber in both modes |
| `--muted-foreground`   | `25 9% 46%`               | `25 8% 56%`              | Subtitles, placeholder text       |
| `--border`             | `30 18% 88%`              | `20 9% 22%`              | Dividers, input borders           |

### Chart scale (Amber)

| Token       | Value                       | Hex             |
| ----------- | --------------------------- | --------------- |
| `--chart-1` | `38 92% 50%` / `43 96% 56%` | Amber 500 / 400 |
| `--chart-2` | `32 95% 44%` / `38 92% 50%` | Amber 600 / 500 |
| `--chart-3` | `26 90% 37%` / `32 95% 44%` | Amber 700 / 600 |
| `--chart-4` | `43 96% 56%` / `26 90% 37%` | Amber 400 / 700 |
| `--chart-5` | `20 60% 30%` / `20 60% 42%` | Amber-brown     |

Light mode orders richest first; dark mode orders lightest first for contrast.

### Radius

`--radius: 0.5rem` — applied as `rounded-lg` (0.5rem), `rounded-md` (0.375rem), `rounded-sm` (0.25rem).

---

## 8. TypeScript Rules

`tsconfig.json` enforces `strict: true`, `noUnusedLocals: true`, and `noUnusedParameters: true`. These are non-negotiable.

| Rule                                 | Reason                                                                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Never use `any`                      | Defeats type safety. Use `unknown` and narrow. Source: _Clean Code_ by Robert C. Martin — Chapter 14                                                                                                                                                 |
| Import types with `import type`      | Erased at compile time — zero runtime cost. Required by `isolatedModules: true`.                                                                                                                                                                     |
| Prefer `interface` for object shapes | Interfaces are open for extension (declaration merging); use `type` for unions and computed types. Source: [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) |
| No non-null assertions (`!`)         | Use optional chaining (`?.`) and nullish coalescing (`??`) instead                                                                                                                                                                                   |
| Reducer over useState chains         | When a component has 3+ related state variables, extract a `useReducer`. Source: [React Docs — useReducer](https://react.dev/reference/react/useReducer)                                                                                             |

---

## 9. Forms & Zod Validation

Every form in the application must be backed by a Zod schema. No exceptions.

### Schema location

```
src/modules/<feature>/schemas/<feature>Schemas.ts
```

### Pattern

```ts
// 1. Define schema
export const dailyExpenseSchema = z.object({
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.coerce.number().positive('Debe ser mayor a 0'),
  category: categoryEnum,
  isCC: z.boolean().default(false),
})

// 2. Export inferred type
export type DailyExpenseFormValues = z.infer<typeof dailyExpenseSchema>
```

```tsx
// 3. Wire to react-hook-form
const { register, handleSubmit } = useForm<DailyExpenseFormValues>({
  resolver: zodResolver(dailyExpenseSchema),
})
```

**Why Zod?** Runtime validation catches bad data at the boundary. Schema-first design makes the domain contract explicit. Source: [Zod Documentation](https://zod.dev/).

---

## 10. Hooks Architecture

- Hooks live in `src/modules/<feature>/hooks/`.
- **One hook = one concern.** A hook that manages list state does not also manage filter UI state.
- Use `useReducer` for any hook that has more than two related state variables (loading, data, error is already three).
- API calls happen inside hooks — never inside component event handlers.
- Hooks return stable references. Wrap callbacks in `useCallback` when they are passed to `useEffect` dependencies.

### Standard hook reducer pattern

```ts
type State = { data: T[]; isLoading: boolean; error: string | null }
type Action =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; data: T[] }
  | { type: 'ERROR'; error: string }
  | { type: 'UPDATE_ONE'; item: T }
  | { type: 'ADD_ONE'; item: T }
  | { type: 'REMOVE_ONE'; id: string }
```

Source: [React Docs — Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer).

---

## 11. Services Architecture

- Services live in `src/services/`.
- Services are class-based and exported as singletons.
- They are the **only** layer that imports from `axios`.
- They return DTOs, not raw `AxiosResponse` objects.
- Mock mode is controlled by `USE_MOCK` at the top of each service file — flip this to `false` when connecting to a real API.

```ts
// Pattern
class TransactionService extends BaseApiService {
  list(filter: Filter): Promise<PaginatedResponseDTO<TransactionResponseDTO>> { ... }
}

export const transactionService = new TransactionService()
```

Source: _Clean Architecture_ by Robert C. Martin — Dependency Rule: inner layers must not depend on outer layers.

---

## 12. Business Domain Rules

These rules are domain invariants. They must never be violated regardless of UI changes.

### Rule 1 — Credit Card Logic

A transaction with `isCC = true` represents **projected debt** on a credit card. It **must not** reduce `currentBalance` or `projectedBalance` until the CC statement payment is processed (a separate `adjustment` transaction).

```ts
// ✅ Correct — exclude CC from bank balance calculation
const bankBalance = transactions
  .filter((tx) => !tx.isCC)
  .reduce((sum, tx) => sum - tx.amount, initialBalance)
```

### Rule 2 — Quincena Date Range Label

Every page header that shows a month/year subtitle **must** also show the quincena day range when `quincena !== 'mensual'`. Use the shared utility — never inline this logic.

```tsx
// ✅ Correct — use the shared utility
import { getQuincenaDateRangeLabel } from '@/lib/utils'

const rangeLabel = getQuincenaDateRangeLabel(filter.quincena, filter.month, filter.year)

<p className="text-sm text-muted-foreground">
  {months[filter.month - 1]} {filter.year}{rangeLabel ? ` · ${rangeLabel}` : ''}
</p>
```

`getQuincenaDateRangeLabel` uses `getQuincenaDays` internally, which correctly computes the actual last day of each month (e.g., February returns "Días 16–28", not "Días 16–31").

### Rule 3 — CC Expiry Input

**Never sanitize, strip, or transform `/` characters** from credit card expiry date inputs. The raw user input (e.g., `12/25`) must pass through validation and storage unchanged. Source: `CLAUDE.md` — Sanitization Rule.

### Rule 4 — Domain Vocabulary

| Use         | Never use                             |
| ----------- | ------------------------------------- |
| INCOME      | Revenue, Ingreso (in code)            |
| EXPENSE     | Expense (as a generic top-level term) |
| TRANSACTION | Entry, Record                         |
| `isCC`      | `isCreditCard`, `creditCard`          |
| `quincena`  | `fortnight`, `biweekly`               |

---

## 13. i18n Rules

- Language files live in `src/i18n/locales/`.
- Spanish (`es`) is the primary language. English (`en`) is secondary.
- All user-visible strings must use `t('key')` — no hardcoded Spanish strings in JSX.
- Translation keys follow dot-notation namespacing: `transactions.statusConfirmed`, `categories.vivienda`.
- Error messages in Zod schemas are the exception — they may be hardcoded in Spanish as they are tightly coupled to the schema definition.

---

## 14. Framework: Next.js App Router

This project **completed** its migration from Vite to **Next.js (App Router)**. All
application code lives under `src/` and the framework is Next.js 15.

- **Routing:** `src/app/` with route groups `(auth)` (public) and `(protected)`
  (auth-guarded via the `(protected)/layout.tsx` client guard).
- **Components:** the app is **client-first** by design — most pages and feature
  components are `'use client'` because of heavy interactivity (forms, charts, tables,
  TanStack Query). Keep a component as a Server Component only when it has no
  interactivity/state. Do not add `'use client'` to a component that doesn't need it.
- **Domain code:** `src/core/types` (entities) and `src/lib/utils` (helpers). A legacy
  root-level `lib/` may linger from the migration — ignore it; never import from it.

---

## 15. Configuration Files Reference

| File                  | Purpose                   | Key settings                                                                   |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `next.config.ts`      | Next.js + PWA build       | `reactStrictMode`, `@ducanh2912/next-pwa` (`dest: public`, NetworkFirst API cache, disabled in dev) |
| `tailwind.config.js`  | Tailwind theme extension  | `fontFamily` via `var(--font-sans)` / `var(--font-geist-mono)`, CSS variable color tokens |
| `tsconfig.json`       | TypeScript compiler       | `strict: true`, `jsx: preserve`, `next` plugin, `@/*` → `./src/*`              |
| `components.json`     | Shadcn CLI config         | `baseColor: stone`, `cssVariables: true`, `utils: @/lib/utils`                 |
| `src/app/globals.css` | Global styles + theme     | Taupe & Amber HSL variables, `--font-*` tokens, Tailwind layers                |
| `src/app/layout.tsx`  | Root layout               | `next/font` (Inter + Geist Mono), metadata, manifest, anti-FOUC theme script   |
| `CLAUDE.md`           | AI assistant instructions | Business rules, architecture decisions, non-negotiable constraints             |

---

_Last updated: 2026-06-15. Maintained alongside `CLAUDE.md` as the project source of truth._
