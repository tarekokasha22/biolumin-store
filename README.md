# 🌌 Biolumin — High-End Luxury Fashion E-Commerce & Admin Command Center

<div align="center">
  
  **Wear your light • نورِك يبان**
  
  *A boutique, bilingual (Arabic-English), one-of-one luxury retail store designed with high-end glassmorphism styling, drop-based releases, and a full Shopify-level Admin Command Center.*

  [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Database](https://img.shields.io/badge/Database-PostgreSQL_Neon-00e676?logo=postgresql&logoColor=white)](https://neon.tech/)
  [![Hosting](https://img.shields.io/badge/Hosting-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

  ### 🔗 Live Storefront: [biolumin-eg.vercel.app](https://biolumin-eg.vercel.app)
  
</div>

---

## 📖 Table of Contents
1. [Brand Concept & Design Philosophy](#-brand-concept--design-philosophy)
2. [Key Features](#-key-features)
   - [🛍️ Storefront & Cart Experience](#️-storefront--cart-experience)
   - [💳 Egyptian Checkout & Payment Engine](#-egyptian-checkout--payment-engine)
   - [👑 Shopify-Level Admin Command Center](#-shopify-level-admin-command-center)
3. [Architecture & Technology Stack](#-architecture--technology-stack)
4. [Database Architecture](#-database-architecture)
5. [Getting Started & Local Setup](#-getting-started--local-setup)
6. [Environment Configuration](#-environment-configuration)
7. [Deployment & Production Run](#-deployment--production-run)
8. [License](#-license)

---

## 🎨 Brand Concept & Design Philosophy

Biolumin is a luxury fashion storefront designed to celebrate individuality with **exclusive, one-of-one luxury garments**. The storefront follows the *limited drop model*, creating high anticipation for every release.

*   **Bilingual Symmetry (AR/EN):** Perfect RTL/LTR layouts with automatic language switching via `next-intl`. Taglines and headers align serif weights, sizing, and colors between English "Wear your light" and Arabic "نورِك يبان".
*   **Aesthetic System:** Curated premium dark-mode styling utilizing sleek glassmorphism panels, soft ambient backdrops, subtle gold/champagne gradients, and Outfit/serif typography.
*   **High Performance:** Highly optimized with micro-interactions, responsive hover transitions, custom Framer Motion page entries, and lightweight alert toasts.

---

## ✨ Key Features

### 🛍️ Storefront & Cart Experience
*   **Exclusive Dropping Engine:** Real-time header countdown timer driven dynamically by the admin panel. Features localized Arabic-Indic digit rendering when browsing in Arabic.
*   **One-of-One Inventory Management:** Automated lock-out checks to prevent double-purchasing of exclusive single-edition items. Sold items display as "SOLD / اتباعت".
*   **Rich Media Gallery:** Clean product detail pages featuring thumbnail galleries and floating dots overlays for clean image control.
*   **30-Minute Hold Sweeper:** Automatic cart reservation timer holding exclusive items during checkout before returning them to stock if unpaid.

### 💳 Egyptian Checkout & Payment Engine
*   **Dual Payment Support:** Paymob Card gateway for automated card payments or Instapay / Mobile Wallet manual transfers.
*   **Payment-Proof Upload:** Integrated with **Vercel Blob Storage** allowing customers to upload screenshot proof for manual transfers at checkout with instant validation.
*   **Prepaid Nudge:** Configurable prepaid reward discount percentage shown at checkout to encourage non-COD payment modes.
*   **Dynamic Shipping Engine:** Regional delivery fee calculation based on Egyptian governorate zones (Cairo, Delta, Canal, Upper Egypt, Remote) with free shipping threshold support.

### 👑 Shopify-Level Admin Command Center (`/admin`)
*   **Collapsible Global Sidebar:** Unified, responsive dark-mode sidebar navigation accessible across all admin tools.
*   **📊 Analytics Dashboard (`/admin/dashboard`):** 
    - Real-time KPI summary cards with 30-day sparkline trends & Month-over-Month percentage badges.
    - Pure SVG 30-Day Revenue Bar Chart & Order Status Donut Breakdown (Pending / Confirmed / Shipped / Delivered).
    - Geographic sales breakdown by Egyptian governorate.
    - Top revenue-generating products & payment method distribution (COD vs Manual vs Paymob).
*   **🔀 Storefront Drag-and-Drop Reordering (`/admin/products/sorting`):** Native HTML5 drag-and-drop catalog management. Pin exclusive items directly to position #1 or re-arrange product visibility instantly.
*   **📋 Orders Management (`/admin/orders`):** Filter by status, search by customer/phone, status progression pipeline (Pending → Confirmed → Shipped → Delivered), automated inventory release on cancellation, WhatsApp direct message links, and 1-click **CSV export**.
*   **📦 Inventory Command (`/admin/inventory`):** Complete stock control with instant status toggle switches (Available / Reserved / Sold).
*   **💸 Discounts & Promotions (`/admin/discounts`):** Percentage or fixed-amount promo code generator with minimum subtotal, redemption caps, and expiry dates.
*   **🎬 Drop Releases (`/admin/drops`):** Schedule countdown release dates and manage live/draft states.
*   **⭐ Reviews & Social Proof (`/admin/reviews`):** Manage bilingual customer reviews and toggle "Featured on Homepage" badges.
*   **📧 Subscriber List (`/admin/subscribers`):** View subscriber growth and export mailing lists to CSV.
*   **⚙️ Settings Overview (`/admin/settings`):** Centralized overview of store configuration, payment handles, shipping rates, and security tokens.
*   **🔔 Real-Time Order Pulse:** Live polling order detector with audio chime notification when new orders land.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    User([User Client]) --> NextJS[Next.js 16 App Router]
    NextJS --> Middleware[Locale Middleware]
    NextJS --> VercelBlob[Vercel Blob Storage]
    NextJS --> Prisma[Prisma ORM Client]
    Prisma --> Postgres[(Neon Serverless Postgres)]
    NextJS --> Paymob[Paymob API]
```

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router with Turbopack for fast compilation).
*   **Internationalization:** `next-intl` powering real-time bilingual translation (Arabic & English).
*   **Database ORM:** [Prisma Client](https://www.prisma.io/) with custom database pooling structures.
*   **Database:** Serverless PostgreSQL on [Neon](https://neon.tech/) with pooled connections for API requests.
*   **Styling:** [TailwindCSS 4](https://tailwindcss.com/) with raw custom CSS tokens and Google Fonts optimization.
*   **Animations:** `framer-motion` for fluid smooth-scrolling and page entries.

---

## 🗄️ Database Architecture

The data layout is managed via Prisma schema (`prisma/schema.prisma`):

*   **`Product`:** Defines localized descriptions (EN/AR), prices, size, availability status (`AVAILABLE`, `RESERVED`, `SOLD`), manual `sortOrder`, images, and drop association.
*   **`Drop`:** Defines release names, active state, release dates, and countdown timer variables (`closesAt`).
*   **`Order`:** Records client credentials, governorate zone, shipping address, transaction proof screenshot URL, items, total price, payment method, and tracking status.
*   **`OrderItem`:** Snapshot of product details at the exact moment of purchase.
*   **`PaymentProof`:** Stores proof screenshot links and approval verification status.
*   **`DiscountCode`:** Manages coupon rules, expiry parameters, minimum subtotal, and usage limits.
*   **`Review`:** Stores bilingual user reviews, star ratings, and home page feature flags.
*   **`Subscriber`:** Stores newsletter mailing addresses and subscription timestamps.

---

## 🚀 Getting Started & Local Setup

### 📋 Prerequisites
*   Node.js (v20+ recommended)
*   npm or pnpm / bun
*   A running PostgreSQL instance (or Neon database account)

### ⚙️ Step-by-Step Installation
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/tarekokasha22/biolumin-store.git
    cd biolumin-store
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```
4.  **Database Migration:**
    Push the schema to your database:
    ```bash
    npx prisma db push
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your web browser. Admin panel is available at `http://localhost:3000/admin`.

---

## 🔒 Environment Configuration

Create a `.env` file in the root directory and configure your parameters:

```ini
# Database Connections (Neon Postgres)
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@host.neon.tech/neondb?sslmode=require"

# Vercel Blob Storage Token (Media Proofs & Uploads)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token"

# Admin Dashboard Access
ADMIN_PASSWORD="your_admin_secret_password"
ADMIN_JWT_SECRET="your_jwt_signing_key_for_sessions"

# Public Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Checkout Payment Accounts
NEXT_PUBLIC_INSTAPAY_HANDLE="example@instapay"
NEXT_PUBLIC_WALLET_NUMBER="01XXXXXXXXX"
NEXT_PUBLIC_PREPAID_DISCOUNT="0"

# Regional Shipping Rates (EGP)
NEXT_PUBLIC_SHIP_CAIRO="50"
NEXT_PUBLIC_SHIP_DELTA="50"
NEXT_PUBLIC_SHIP_CANAL="70"
NEXT_PUBLIC_SHIP_UPPER="85"
NEXT_PUBLIC_SHIP_REMOTE="110"
NEXT_PUBLIC_FREE_SHIP_THRESHOLD="1000"
NEXT_PUBLIC_COD_FEE="0"

# WhatsApp Notifications & Contact
NEXT_PUBLIC_WHATSAPP_NUMBER="201XXXXXXXXX"
OWNER_WHATSAPP_NUMBER="201XXXXXXXXX"
WHATSAPP_NOTIFY_URL=""

# Paymob Credentials (Optional Card Payments)
PAYMOB_API_KEY="your_paymob_api_token"
PAYMOB_HMAC="your_paymob_hmac_secret"
PAYMOB_INTEGRATION_ID=""
PAYMOB_IFRAME_ID=""
```

---

## ☁️ Deployment & Production Run

The repository is built to deploy natively on **Vercel** with zero configuration required.

*   Vercel will detect Next.js settings automatically.
*   Prisma database migrations will run during the build step using the configuration in `package.json` (`npm run build` runs `prisma generate && next build`).
*   Ensure all environment variables are added in your Vercel Project Settings panel.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Feel free to modify, distribute, or use it for commercial and private purposes.
