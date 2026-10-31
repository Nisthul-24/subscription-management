# Brightloop Subscription Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-teal.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-28%20Passing-brightgreen.svg)]()

> **Brightloop** is an enterprise-grade, unified subscription management, automated billing, payment recording, and recurring revenue analytics platform built for SaaS businesses. It replaces spreadsheets, hand-typed invoices, and manual bank-statement matching with an automated, audit-logged billing engine.

---

## 🌟 Key Features

- **Products & Dynamic Variants**: Base products (services or goods) with customizable attributes and variant pricing (e.g. Hosting Tiers, Support Packages).
- **Flexible Subscription Plans**: Daily, Weekly, Monthly, and Yearly cadence with guard rules:
  - `pausable`: Controls whether active subscriptions can be temporarily paused.
  - `closableEarly`: Restricts early cancellations before the contract period concludes.
  - `autoCloseAtEnd`: Automatically transitions active subscriptions to `CLOSED` upon reaching expiry date.
  - `renewable`: Dictates renewal eligibility.
- **Discount Engine**: Fixed amount or percentage discounts scoped to subscriptions or individual products. Implements **highest-value-wins** automatic resolution and atomic usage limit decrementing.
- **Basis Points (bps) Tax Calculation**: Tax-exclusive pricing with basis points (e.g., `1800` = `18.00%`) using standard **half-up rounding** (`roundHalfUp`), avoiding floating-point rounding errors.
- **Monotonic Gap-Free Sequencing**: Format-compliant, sequential numbering for Subscriptions (`SUB-YYYYMM-XXXXX`) and Invoices (`INV-YYYYMM-XXXXX`) using atomic sequence generation.
- **Automated Catch-up Billing Engine**:
  - **Idempotent**: Enforced via unique database constraint on `(subscriptionId, billingPeriodKey)`.
  - **Catch-up**: Automatically detects and bills all missed billing intervals if a scheduler was offline.
  - **Auto-close**: Detects and cleanly marks contracts `CLOSED` when reaching expiry date.
- **Audit Logging**: Every status transition (Draft ➔ Quotation ➔ Confirmed ➔ Active ➔ Paused ➔ Closed) is immutably recorded in `status_logs` with timestamps, author IDs, and reasons.
- **Invoicing & PDF Generation**: Instant generation and streaming of PDF invoices via `@react-pdf/renderer` with download endpoints.
- **Customer Portal**: Isolated self-service view allowing clients to view active subscriptions, review billing history, and download PDF invoices.
- **Live Recurring Revenue Analytics**: Real-time KPI dashboard computing **MRR**, **ARR**, outstanding receivables, overdue invoices, 6-month historical revenue trends, and payment method distribution in under 2 seconds even with 20,000+ invoices.

---

## 🏛️ System Architecture & Domain Rules

### 1. Currency & Arithmetic Invariants
- All monetary values are strictly represented as **integer cents** (e.g., `$49.00` = `4900`). Floating-point currency arithmetic is prohibited.
- Tax rates are stored in **basis points (bps)** (`1%` = `100 bps`, `18.5%` = `1850 bps`).
- Rounding follows the financial standard **half-up** rounding (`Math.floor(x + 0.5)`).

### 2. Subscription State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> QUOTATION: submit_quotation
    QUOTATION --> CONFIRMED: confirm
    CONFIRMED --> ACTIVE: activate
    ACTIVE --> PAUSED: pause (if plan.pausable)
    PAUSED --> ACTIVE: resume
    ACTIVE --> CLOSED: close (if plan.closableEarly or autoCloseAtEnd)
    PAUSED --> CLOSED: close
```

### 3. Invoice State Machine
```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> CONFIRMED: confirm
    DRAFT --> CANCELLED: cancel
    CONFIRMED --> PAID: record_payment (paidCents >= totalCents)
    CONFIRMED --> CANCELLED: cancel
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **PostgreSQL**: Local PostgreSQL daemon or Docker

### 1. Database Setup

You can run PostgreSQL either with the bundled Prisma Dev daemon or using Docker Compose:

#### Option A: Prisma Dev Embedded PostgreSQL (Recommended for Local Dev)
```bash
# Starts embedded PostgreSQL daemon on localhost:51214
npx prisma dev
```

#### Option B: Docker Compose
```bash
docker compose up -d
```

### 2. Environment Configuration
Ensure `.env` contains:
```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable"
JWT_SECRET="brightloop-super-secure-production-jwt-secret-key-32chars"
PORT=3000
```

### 3. Schema Push & Seeding
```bash
# Sync schema with database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed initial demo accounts, plans, tax rules, and products
npx -y tsx prisma/seed.ts
```

### 4. Running the Web Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running the Background Billing Worker
The billing worker can be launched as a standalone background process:
```bash
npm run worker
```
By default, the worker runs an automated catch-up billing sweep every 60 seconds (configurable via `BILLING_INTERVAL_SECONDS`).

---

## 🔑 Demo Accounts & Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.dev` | `Admin@123!` | Full system access (products, plans, taxes, billing runs, analytics) |
| **Staff** | `staff@brightloop.dev` | `Staff@123!` | Subscriptions, invoices, customers, payment recording |
| **Customer** | `customer@brightloop.dev` | `Customer@123!` | Dedicated Customer Portal (view own subscriptions & invoices) |

> **Password Policy**: Passwords require a minimum of 9 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character.

---

## 🧪 Testing & Validation

### Running Unit Tests
Unit tests test monetary arithmetic, basis points, half-up rounding, state transitions, plan guards, and billing date intervals:
```bash
npm run test
```
**Results**: 28 passing unit tests across `money.test.ts`, `status-machine.test.ts`, `auth.test.ts`, and `billing.test.ts`.

### Performance & High-Volume Validation
Brightloop includes a high-volume seeding script generating **5,000 subscriptions**, **22,500+ invoices**, and **20,000+ payments** to validate production performance:
```bash
# Run high-volume seed (takes ~30s)
npm run seed:large

# Run performance verification test
npx -y tsx tests/perf-test.ts
```

**Benchmark Results**:
- **Dataset**: 500 customers, 5,000 subscriptions, 22,501 invoices, 20,251 payments.
- **Direct Database Counts**: ~180ms.
- **Live Dashboard Load Time**: **1.51 seconds** (SLA target: < 2.0s).
- **MRR & ARR Calculation**: Instantaneous aggregate query with active subscription line rollups.

---

## 📂 Project Structure

```
brightloop/
├── prisma/
│   ├── schema.prisma       # Complete schema (Users, Plans, Products, Subscriptions, Invoices, Payments, StatusLog)
│   ├── seed.ts             # Initial base demo seed
│   └── seed-large.ts       # Bulk production scale seed (5k subs, 22k invoices)
├── src/
│   ├── app/
│   │   ├── (auth)/         # Signin, Signup, Forgot Password, Reset Password
│   │   ├── dashboard/      # Admin/Staff Executive Analytics Dashboard
│   │   ├── subscriptions/  # Subscriptions management & creation
│   │   ├── invoices/       # Invoices list, details, payments, PDF downloads
│   │   ├── customers/      # Customer directory
│   │   ├── portal/         # Customer self-service portal
│   │   └── api/            # 20+ REST API endpoints with role guards
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, Header
│   │   └── ui/             # Form controls, badges, modals, charts
│   ├── lib/
│   │   ├── db.ts           # PrismaClient with PrismaPg adapter & connection pool
│   │   ├── money.ts        # Cent arithmetic, formatMoney, half-up rounding
│   │   ├── sequence.ts     # Atomic monotonic gap-free sequence generator
│   │   ├── status-machine.ts# Plan-guarded state machines
│   │   ├── discount.ts     # Discount priority resolution & atomic decrement
│   │   ├── tax.ts          # Basis points tax engine
│   │   ├── auth.ts         # JWT access & refresh tokens, cookies, role guards
│   │   ├── pdf.tsx         # @react-pdf/renderer invoice template
│   │   └── billing.ts      # Automated catch-up billing engine & auto-closer
│   └── workers/
│       ├── scheduler.ts    # Standalone interval billing runner
│       └── bullmq.worker.ts# BullMQ distributed queue worker (when Redis is configured)
├── tests/
│   ├── money.test.ts
│   ├── status-machine.test.ts
│   ├── auth.test.ts
│   ├── billing.test.ts
│   └── perf-test.ts
└── README.md
```

---

## 📡 API Reference

### Authentication
- `POST /api/auth/signup`: User registration with strict password validation.
- `POST /api/auth/signin`: Authenticate with HTTP-only cookies (`accessToken` 15m, `refreshToken` 7d).
- `POST /api/auth/signout`: Invalidate and clear auth cookies.
- `GET /api/auth/me`: Fetch authenticated user profile.
- `POST /api/auth/forgot-password`: Dispatch password reset token.
- `POST /api/auth/reset-password`: Reset password with secure one-time token.

### Subscriptions & Invoices
- `GET /api/subscriptions`: Paginated subscriptions with status filter.
- `POST /api/subscriptions`: Create subscription with lines and tax assignments.
- `GET /api/subscriptions/:id`: Retrieve subscription details and line items.
- `POST /api/subscriptions/:id/transition`: Execute state transition (`submit_quotation`, `confirm`, `activate`, `pause`, `resume`, `close`).
- `GET /api/invoices`: Paginated invoice listing with status/customer filters.
- `GET /api/invoices/:id`: Invoice detail with lines and recorded payments.
- `GET /api/invoices/:id/pdf`: Stream compiled PDF invoice buffer.
- `POST /api/invoices/:id/action`: Execute invoice state transition (`confirm`, `cancel`).
- `POST /api/payments`: Record payment against an invoice (updates `paidCents` and auto-marks `PAID`).

### Administration & Billing
- `POST /api/admin/billing/run`: Manually trigger billing run for arbitrary date (auto-generates invoices & closes expired subscriptions).
- `GET /api/dashboard`: Fetch live KPIs (Active Subs, MRR, ARR, Total Revenue, Outstanding, 6-Month Trend, Payment Methods).
- `GET /api/reports/export`: Export CSV reports for Subscriptions, Invoices, or Payments.

### Customer Portal
- `GET /api/portal/subscriptions`: List customer's own subscriptions.
- `GET /api/portal/invoices`: List customer's own invoices.
- `POST /api/portal/subscriptions/:id/action`: Self-service quotation confirmation or cancellation.

---

## 📄 License
Brightloop is proprietary software. All rights reserved.
