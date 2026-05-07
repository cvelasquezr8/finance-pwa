# Finance PWA - Frontend Guidelines

## 1. Project Vision & Business Logic

Personal Finance PWA for tracking transactions, budgets, and cash flow.

- **Core Concept:** Everything is a `Transaction`. Differentiate between `INCOME` and `EXPENSE`. Never use "Expense" as a generic term.
- **Credit Card Logic:** CC transactions represent projected debt. They must not decrease the immediate "Cash Balance" until the statement payment is processed.
- **Sanitization Rule:** Strictly **DO NOT** remove or sanitize slashes (`/`) from credit card expiration date inputs.
- **Current Task:** Modernizing and migrating logic from the original Vite implementation to Next.js (App Router).

## 2. Tech Stack

- **Framework:** Next.js (App Router), TypeScript.
- **UI/Styling:** Tailwind CSS, Shadcn/UI, Lucide React.
- **Forms & Validation:** `react-hook-form` with `Zod` schemas.
- **State Management:** TanStack Query (Server State), Zustand or native Hooks (UI State).

## 3. Architecture & Patterns (DDD)

- **Domain:** Pure business logic and types (Transaction, Account, User).
- **Presentation:**
  - `@/components/ui`: Shadcn/UI primitives.
  - `@/components/shared`: Feature-specific components.
- **Hooks:** Encapsulate business logic and data fetching into custom hooks.
- **Server vs Client:** Maximize Server Components. Use `'use client'` only for interactive elements.

## 4. Specialized Agent Personas (Shadcn/Tailwind Context)

- **Shadcn Expert:** You have deep knowledge of `@/lib/utils.ts` and the `cn()` helper. Always prefer extending existing Shadcn components over creating new ones.
- **Tailwind Strategist:** Focus on responsive design (mobile-first). Use arbitrary values `[]` only when strictly necessary; prefer the standard design system.
- **Next.js Architect:** Expert in the distinction between Server and Client components. You must ensure that heavy logic stays in Server Components to keep the PWA fast.
- **Zod & Type Auditor:** Ensure that every form in the PWA is backed by a Zod schema that matches our `Transaction` domain.

## 5. Development Rules

- **Naming:** camelCase for variables/functions, PascalCase for components/classes, kebab-case for file names.
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
