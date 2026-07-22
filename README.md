# 🌌 Biolumin — High-End Luxury Fashion E-Commerce

<div align="center">
  
  **Wear your light • نورِك يبان**
  
  *A boutique, bilingual (Arabic-English), one-of-one luxury retail store designed with high-end glassmorphism styling and drop-based releases.*

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
3. [Architecture & Technology Stack](#-architecture--technology-stack)
4. [Database Architecture](#-database-architecture)
5. [Getting Started & Local Setup](#-getting-started--local-setup)
6. [Environment Configuration](#-environment-configuration)
7. [Deployment & Production Run](#-deployment--production-run)
8. [License](#-license)

---

## 🎨 Brand Concept & Design Philosophy

Biolumin is a high-end fashion storefront designed to celebrate individuality with **exclusive, one-of-one luxury garments**. The storefront follows the *limited drop model*, creating high anticipation for every release.

*   **Bilingual Symmetry (AR/EN):** Perfect RTL/LTR layouts with automatic language switching. Taglines and headers align serif weights, sizing, and colors between English "Wear your light" and Arabic "نورِك يبان".
*   **Aesthetic System:** Curated premium dark-mode styling utilizing sleek glassmorphism panels, soft ambient backdrops, subtle gold/champagne gradients, and Outfit/serif typography.
*   **High Scroll-Performance:** Highly optimized with micro-interactions, responsive hover transitions, custom Framer Motion page entries, and lightweight alert toasts.

---

## ✨ Key Features

### 🛍️ Premium Storefront & Cart Experience
*   **Exclusive Dropping Engine:** A real-time header countdown timer driven dynamically by the admin panel. Features localized Arabic-Indic digit rendering when browsing in Arabic.
*   **One-of-One Inventory Management:** Automated lock-out checks to prevent double-purchasing of exclusive single-edition items. Sold items display as "SOLD / اتباعت".
*   **Rich Media Gallery:** Clean product detail pages featuring thumbnail galleries and floating dots overlays for clean image control.

### 💳 Fail-Safe Egyptian Checkout & Payment
*   **Dual payment support:** Paymob Card gateway for automated card payments or Instapay/Mobile Wallet manual transfers.
*   **Payment-Proof Upload:** Integrated with **Vercel Blob Storage** allowing customers to upload screenshot proof for manual transfers at checkout with instant error validations.
*   **Prepaid Nudge:** Configurable prepaid reward discount percentage shown at checkout to encourage non-COD payment modes.
*   **Dynamic Shipping:** Dynamic delivery fee calculation based on regional zones (Cairo, Delta, Canal, Upper Egypt, Remote) with free shipping over threshold configurations.

### ⚙️ Interactive Admin Dashboard
*   **Business Command Center:** Access sales statistics, analytics metrics, and drop schedules directly.
*   **Subscribers & Discounts:** Manage mailing lists and configure dynamic promotional codes.
*   **Order Pulse Tracker:** Displays incoming order feeds in real-time, accompanied by a custom Shopify-style sound chime for new orders.

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

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router with Turbopack for lightning-fast compilation).
*   **Internationalization:** `next-intl` powering real-time bilingual translation files.
*   **Database ORM:** [Prisma Client](https://www.prisma.io/) with custom database pooling structures.
*   **Database:** Serverless PostgreSQL on [Neon](https://neon.tech/) with pooled connections for fast API requests.
*   **Styling:** [TailwindCSS 4](https://tailwindcss.com/) with raw custom CSS tokens and Google Fonts optimization.
*   **Animations:** `framer-motion` and `GSAP` / `Lenis Scroll` for fluid smooth-scrolling and page entries.

---

## 🗄️ Database Architecture

The data layout is managed via Prisma. Here are the core entities:

*   **`Product`:** Defines product dimensions, descriptions (AR/EN), tags, price, size, availability, images, and association to a specific drop.
*   **`Drop`:** Defines release names, active states, and countdown timer variables (`closesAt`).
*   **`Order`:** Records client credentials, chosen zone, shipping address, transaction proof screenshot URL, items, total price, payment method, and tracking status.
*   **`Discount`:** Manages coupon rules, expiry parameters, and remaining usage limits.
*   **`Subscriber`:** Stores mailing addresses and subscription timestamps.

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
4.  **Database Migration & Seeding:**
    Run the migrations and populate the database with default inventory:
    ```bash
    npx prisma db push
    npm run db:seed
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your web browser.

---

## 🔒 Environment Configuration

Create a `.env` file in the root directory and configure the following parameters:

```ini
# Database Connections
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Vercel Blob Storage Token (Media Proofs)
BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token"

# Admin Dashboard Access
ADMIN_PASSWORD="your_admin_secret_password"
ADMIN_JWT_SECRET="your_jwt_signing_key_for_sessions"

# Public Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Checkout Payment Accounts
NEXT_PUBLIC_INSTAPAY_HANDLE="example@instapay"
NEXT_PUBLIC_WALLET_NUMBER="01XXXXXXXXX"
NEXT_PUBLIC_PREPAID_DISCOUNT="5"

# WhatsApp Notifications & Integrations
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
*   Ensure all environmental variables are added in your Vercel Project Settings panel.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Feel free to modify, distribute, or use it for commercial and private purposes.
