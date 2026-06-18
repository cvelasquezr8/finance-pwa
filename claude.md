# Finance PWA - Frontend Guidelines

## 1. Project Vision & Business Logic

Personal Finance PWA for tracking transactions, budgets, and cash flow.

- **Core Concept:** Everything is a `Transaction`. Differentiate between `INCOME` and `EXPENSE`. Never use "Expense" as a generic term.
- **Credit Card Logic:** CC transactions (`isCC: true`) represent projected debt. They must not decrease the immediate "Cash Balance" until the statement payment is processed.
- **Sanitization Rule (future feature):** When a credit-card **expiration date** input is added, strictly **DO NOT** remove or sanitize slashes (`/`) from it. ⚠️ No `expiryDate` input exists yet — the `CardDTO.expiryDate` field is display-only; this rule applies the moment the input is built.
- **Login lockout:** The backend blocks an account after **3** consecutive wrong passwords. On a failed login the API returns `401` with `code: 'INVALID_CREDENTIALS'` and a `remaining` count in the message — surface the remaining attempts to the user. Once blocked it returns `401 code: 'ACCOUNT_LOCKED'`; show a "contact an administrator" state (no self-service unlock). A successful login clears the counter.
- **Status:** The Vite → Next.js (App Router) migration is **complete**; current focus is hardening, PWA polish, and feature work.

## 2. Tech Stack

- **Framework:** Next.js (App Router), TypeScript.
- **UI/Styling:** Tailwind CSS, Shadcn/UI, Lucide React.
- **Forms & Validation:** `react-hook-form` with `Zod` schemas.
- **State Management:** TanStack Query (Server State), Zustand or native Hooks (UI State).

## 3. Architecture & Patterns (DDD)

- **Domain:** Pure business logic and types in `@/core/types` and `@/core/dtos`.
- **Presentation:**
  - `@/components/ui`: Shadcn/UI primitives.
  - `@/components/layout`: App shell (Sidebar, BottomBar, filters).
  - `@/modules/<feature>/{components,hooks,schemas}`: feature slices (the project groups by feature, not by a single `shared` folder).
- **Hooks:** Encapsulate business logic and data fetching into custom hooks.
- **Server vs Client (client-first):** The app is intentionally client-first — most pages and feature components are `'use client'` due to heavy interactivity (forms, charts, tables, TanStack Query). Keep a component server-side **only** when it has no interactivity/state; never add `'use client'` to something that doesn't need it.

## 4. Specialized Agent Personas (Shadcn/Tailwind Context)

- **Shadcn Expert:** You have deep knowledge of `@/lib/utils.ts` and the `cn()` helper. Always prefer extending existing Shadcn components over creating new ones.
- **Tailwind Strategist:** Focus on responsive design (mobile-first). Use arbitrary values `[]` only when strictly necessary; prefer the standard design system.
- **Next.js Architect:** Expert in the distinction between Server and Client components. Given this app is client-first, focus on keeping client bundles lean (code-split modals/charts, avoid pulling heavy deps into shared chunks) rather than forcing Server Components where interactivity is required.
- **Zod & Type Auditor:** Ensure that every form in the PWA is backed by a Zod schema that matches our `Transaction` domain.

## 5. Development Rules

- **Naming:** camelCase for variables/functions, PascalCase for components/classes. **File names match their primary export:** PascalCase for component files (`TransactionTable.tsx`), camelCase for hook/schema files (`useTransactions.ts`, `authSchemas.ts`), kebab-case/lowercase for plain util/config modules (`api-config.ts`, `utils.ts`). See `CODING_STANDARDS.md` §3.
- **Style:** No custom CSS. Use Tailwind utility classes for everything.
- **Integrity:** Every transaction input must be validated via Zod.

## 6. Context Loading

Upon session start, Claude must:

1. Scan the `finance-pwa` directory to index existing types and components.
2. Reference this file as the "Source of Truth" for business rules and the credit card slash-sanitization exception.
3. Automatically apply **Frontend Design** skills to all UI requests.

## 7. Mandatory Execution Flow

1. **Check UI:** Before coding, check if the required Shadcn component is in `components/ui`. If not, suggest installing it via CLI.
2. **Review Classes:** Always use `tailwind-merge` and `clsx` logic for conditional classes.
3. **PWA Check:** Ensure all images use `next/image` and all metadata is optimized for mobile installation.
