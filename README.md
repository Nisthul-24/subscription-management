# 🚀 Brightloop Subscription Management System

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **Brightloop** is a full-stack, enterprise-grade **Subscription Management Platform** built for SaaS businesses. It replaces manual spreadsheets and billing processes with a fully automated, centralized system — handling the complete subscription lifecycle from customer onboarding to revenue reporting.

---

## ✨ Key Features

| Module | Highlights |
|---|---|
| 🔐 **Authentication** | JWT-based auth, role-based access (Admin / Staff / Customer), forgot/reset password |
| 📦 **Product Management** | Products with variants, pricing, search & filter |
| 📋 **Subscription Plans** | Daily / Weekly / Monthly / Yearly billing, auto-close, pause & resume |
| 📝 **Quotations** | Reusable templates, unique numbering, convert to subscriptions |
| 🔄 **Subscriptions** | Full lifecycle: Draft → Quotation → Confirmed → Active → Closed |
| 🧾 **Invoice Engine** | Auto-generated, recurring, PDF downloadable, duplicate-safe |
| 💳 **Payments** | Multi-method payment recording, overdue tracking, payment history |
| 🎟️ **Discounts** | Fixed / percentage discounts, usage limits, product-specific or subscription-wide |
| 🧮 **Taxes** | Configurable tax rules applied automatically during billing |
| 📊 **Dashboard & Reports** | MRR, ARR, revenue charts, subscription status distribution, date-range filters |

---

## 🏗️ Technology Stack

### Frontend
- **React.js** — Component-based UI
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Interactive revenue & analytics charts
- **Lucide React** — Modern icon library

### Backend
- **Node.js & Express.js** — RESTful API server
- **MongoDB** — Document database
- **Mongoose** — ODM with schema validation & indexing
- **JWT** — Stateless authentication & authorization
- **bcrypt** — Secure password hashing
- **Nodemailer** — Email delivery for password reset

---

## 👤 User Roles

### 🛡️ Admin
- Full system access
- Manage products, plans, taxes, discounts
- Create and manage staff accounts
- View financial reports and dashboards

### 👨‍💼 Staff
- Manage customers and subscriptions
- Create quotations and invoices
- Record payments
- Permission-limited access

### 🙋 Customer
- Self-service portal
- View active subscriptions
- Download PDF invoices
- Track payment history

---

## 🔄 Subscription State Machine

```
Draft → Quotation → Confirmed → Active → Closed
                                  ↕
                                Paused
```

## 🧾 Invoice State Machine

```
Draft → Confirmed → Paid
  ↓          ↓
Cancelled  Cancelled
```

---

## 📂 Project Structure

```
subscription-management/
├── client/                     # React.js Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── layout/         # Sidebar, Header, AppShell
│   │   │   └── ui/             # Badges, Modals, Tables, Charts
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Forgot/Reset Password
│   │   │   ├── dashboard/      # Admin analytics dashboard
│   │   │   ├── products/       # Product management
│   │   │   ├── plans/          # Subscription plan management
│   │   │   ├── customers/      # Customer directory
│   │   │   ├── subscriptions/  # Subscription lifecycle management
│   │   │   ├── quotations/     # Quotation creation & conversion
│   │   │   ├── invoices/       # Invoice listing, detail, PDF
│   │   │   ├── payments/       # Payment recording & history
│   │   │   ├── discounts/      # Discount rule management
│   │   │   ├── taxes/          # Tax configuration
│   │   │   └── portal/         # Customer self-service portal
│   │   ├── context/            # AuthContext, global state
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # API client, formatters, helpers
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Plan.js
│   │   │   ├── Customer.js
│   │   │   ├── Subscription.js
│   │   │   ├── Invoice.js
│   │   │   ├── Payment.js
│   │   │   ├── Discount.js
│   │   │   └── Tax.js
│   │   ├── routes/             # Express route handlers
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── plans.js
│   │   │   ├── customers.js
│   │   │   ├── subscriptions.js
│   │   │   ├── quotations.js
│   │   │   ├── invoices.js
│   │   │   ├── payments.js
│   │   │   ├── discounts.js
│   │   │   ├── taxes.js
│   │   │   └── dashboard.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification
│   │   │   └── roleGuard.js    # Role-based access control
│   │   ├── services/
│   │   │   ├── billingEngine.js    # Automated recurring billing
│   │   │   ├── invoiceGenerator.js # Invoice creation & PDF
│   │   │   └── emailService.js     # Nodemailer email dispatch
│   │   ├── utils/
│   │   │   ├── sequencer.js    # Unique SUB/INV number generator
│   │   │   └── validators.js   # Input validation helpers
│   │   └── app.js
│   ├── seed/
│   │   └── seed.js             # Sample data seeder
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB** v6+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** or **yarn**

---

### 1. Clone the Repository

```bash
git clone https://github.com/Nisthul-24/subscription-management.git
cd subscription-management
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/brightloop
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for CORS and reset links)
CLIENT_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

> Server runs on **http://localhost:5000**

---

### 3. Seed Sample Data

```bash
cd server
npm run seed
```

This creates:
- Admin, Staff, and Customer demo accounts
- Sample products, plans, taxes, discounts
- Sample customers, subscriptions, and invoices

**Demo Credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@brightloop.com | Admin@1234! |
| Staff | staff@brightloop.com | Staff@1234! |
| Customer | customer@brightloop.com | Customer@1234! |

---

### 4. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

> App runs on **http://localhost:3000**

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user profile |

### Products & Plans
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/products` | List / Create products |
| GET/PUT/DELETE | `/api/products/:id` | Get / Update / Delete product |
| GET/POST | `/api/plans` | List / Create subscription plans |
| GET/PUT/DELETE | `/api/plans/:id` | Get / Update / Delete plan |

### Customers & Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/customers` | List / Create customers |
| GET/POST | `/api/subscriptions` | List / Create subscriptions |
| POST | `/api/subscriptions/:id/transition` | Change subscription status |
| GET/POST | `/api/quotations` | List / Create quotations |
| POST | `/api/quotations/:id/convert` | Convert quotation to subscription |

### Invoices & Payments
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/invoices` | List / Generate invoices |
| POST | `/api/invoices/:id/action` | Confirm / Cancel invoice |
| GET | `/api/invoices/:id/pdf` | Download PDF invoice |
| GET/POST | `/api/payments` | List / Record payments |

### Admin & Reporting
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/billing/run` | Manually trigger billing engine |
| GET | `/api/dashboard` | Live KPIs and analytics |
| GET | `/api/reports/export` | Export CSV reports |

### Discounts & Taxes
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/discounts` | List / Create discount rules |
| GET/PUT/DELETE | `/api/discounts/:id` | Manage discounts |
| GET/POST | `/api/taxes` | List / Create tax rules |

---

## 📊 Dashboard KPIs

- 📈 **Total Active Subscriptions**
- 👥 **Total Customers**
- 💰 **Total Revenue (MRR / ARR)**
- ⏳ **Outstanding Payments**
- ⚠️ **Overdue Invoices**
- 📅 **Upcoming Renewals**
- 📉 **6-Month Revenue Trend Chart**
- 🍩 **Subscription Status Distribution**
- 💳 **Payment Method Breakdown**

---

## 🔒 Security

- ✅ Passwords hashed with **bcrypt** (salt rounds: 12)
- ✅ Stateless **JWT** authentication with short-lived access tokens
- ✅ **Role-based access control** on all API routes
- ✅ Input validation and sanitization on all endpoints
- ✅ Duplicate invoice prevention via unique billing period constraints
- ✅ MongoDB **indexing** on frequently queried fields
- ✅ CORS protection and HTTP-only cookies

---

## ⚡ Performance

- Dashboard loads under **2 seconds** with 5,000+ subscriptions
- Billing engine handles **batch invoice generation** with idempotency checks
- Optimized MongoDB aggregate queries for revenue analytics
- Lazy-loaded pages and code-splitting on the frontend

---

## 📜 License

**Brightloop Subscription Management System** is proprietary software.  
© 2026 Brightloop Software. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ by Brightloop Software</strong>
</div>
