# Finance Manager PWA

Personal finance app with bi-weekly (quincena) budgeting, built with Vite + React (TS) + Tailwind CSS + shadcn/ui, following Domain-Driven Design.

## Stack

| Layer | Tech |
|---|---|
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Forms | React Hook Form + Zod |
| HTTP | Axios with JWT interceptors |
| PWA | vite-plugin-pwa (Workbox) |
| Architecture | Domain-Driven Design (DDD) |

---

## Project Structure

```
src/
├── core/
│   ├── types/        # Domain entities & value objects
│   └── dtos/         # API request/response shapes
├── services/
│   ├── BaseApiService.ts       # Axios instance + interceptors
│   ├── AuthService.ts          # login / register / logout
│   ├── TransactionService.ts   # transactions + balance endpoints
│   └── mock/
│       └── MockAdapter.ts      # In-memory mock with 800ms latency
├── modules/
│   ├── auth/         # LoginForm, RegisterForm, Zod schemas
│   ├── dashboard/    # SummaryCards, BalanceAdjustmentModal, AnalyticsPage
│   └── transactions/ # TransactionTable, AddDailyExpenseModal, hooks
├── components/
│   ├── layout/       # Sidebar (desktop), BottomBar (mobile), MonthFilter
│   └── ui/           # shadcn/ui primitives (Button, Card, Dialog, …)
└── contexts/
    └── AuthContext.tsx  # JWT auth state via useReducer
```

---

## How the Mock Layer Works

```
UI Component
    │
    ▼
useTransactions / useDashboard   ← custom hooks
    │
    ▼
TransactionService / BalanceService   ← domain services (BaseApiService)
    │
    ├── USE_MOCK = true  →  MockAdapter.ts  (800ms delay, in-memory state)
    └── USE_MOCK = false →  Real API (axios, BASE_URL from VITE_API_URL)
```

**To switch to a real API:**

1. Set `USE_MOCK = false` in `src/services/AuthService.ts` and `src/services/TransactionService.ts`
2. Set your API base URL: `VITE_API_URL=https://api.yourapp.com/v1` in `.env`
3. The commented endpoint paths in each service method show the expected routes

---

## API Endpoint Map

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout

GET    /api/v1/transactions?month=&year=&quincena=
POST   /api/v1/transactions
PATCH  /api/v1/transactions/:id/confirm
DELETE /api/v1/transactions/:id

GET    /api/v1/balance?month=&year=&quincena=
POST   /api/v1/balance/adjust
```

---

## Balance Projections

| Metric | Formula |
|---|---|
| **Saldo Proyectado** | `currentBalance + expectedIncome − totalPendingScheduled` |
| **Gasto Diario** | `projectedBalance / remainingDaysInMonth` |
| **Deuda Total** | Sum of all `category = 'deuda'` transactions in the month |

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production + PWA service worker
npm run preview    # preview production build
```

**Login:** any `*@*.com` email + 6-char password works in mock mode.

---

## PWA

The app is installable on mobile (Android/iOS) and desktop via the browser's "Add to Home Screen" / install prompt. The Workbox service worker pre-caches all static assets and uses **NetworkFirst** for API calls with a 5-minute cache fallback.
