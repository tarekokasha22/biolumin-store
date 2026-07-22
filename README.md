# BIOLUMIN — Admin Dashboard

A premium Egyptian fashion boutique with a full **Shopify-level admin panel** built on Next.js 16, Prisma, and Neon PostgreSQL.

---

## ✨ Admin Features

### 📊 Analytics Dashboard (`/admin/dashboard`)
- Revenue KPI cards with 30-day sparklines and month-over-month % change
- 30-day revenue bar chart (pure SVG, no chart library)
- Order status donut chart (Pending / Confirmed / Shipped / Delivered)
- Geographic breakdown by governorate
- Top products by revenue
- Payment method distribution (COD / Bank Transfer / Paymob)
- Recent orders live feed

### 📦 Products (`/admin/products`)
- Full product list with status tabs (Available / Reserved / Sold)
- Search by name, size, Arabic name
- Filter by category
- One-click status transitions
- Link to edit each product

### 🔀 Storefront Order (`/admin/products/sorting`)
- **Drag-and-drop** product grid to control what appears first on the store
- **Pin to Top** button to instantly pin any item to position #1
- **Unpin** to return to natural order
- Save Order persists to database and reflects on the storefront immediately

### 🗂 Inventory (`/admin/inventory`)
- Quick status overview (available / reserved / sold counts)
- Mark sold / make available actions

### 📋 Orders (`/admin/orders`)
- Full order list with status tabs and search
- Revenue / avg. value / pending / today stats
- Advance order status (Pending → Confirmed → Shipped → Delivered)
- Cancel order with automatic product release
- Approve bank transfer proofs
- WhatsApp message customer button
- **CSV export** of all orders

### 💸 Discounts (`/admin/discounts`)
- Create percent or fixed-amount codes
- Set minimum subtotal, max redemptions, expiry date
- Enable / disable / delete codes
- Status badges (Active / Expired / Used up)

### 🎬 Drops (`/admin/drops`)
- Create and manage product drops (numbered releases)
- Set release date and countdown timer end
- Toggle live / draft

### ⭐ Reviews (`/admin/reviews`)
- Add customer reviews manually (bilingual EN + AR)
- Toggle "featured on homepage"
- Delete reviews

### 📧 Subscribers (`/admin/subscribers`)
- Email list from newsletter signups
- CSV export

### ⚙️ Settings (`/admin/settings`)
- Read-only overview of store configuration
- Payment, shipping, and security settings at a glance

### 🏢 Business Hub (`/admin/business`)
- Embedded AI Prompt Library
- Content Command Center

---

## 🛍 Storefront Features

- Bilingual (Arabic / English) with `next-intl`
- Single-item drops model — each product is unique
- 30-minute cart reservation with automatic release
- Cash on delivery, bank transfer, and Paymob card payments
- Nationwide Egypt shipping with zone-based pricing
- WhatsApp order notifications for owner
- Product image gallery with drag-to-reorder in admin
- SEO-optimized with canonical URLs and alternate language tags

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma 6 |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Cormorant Garamond · Montserrat · El Messiri · Tajawal |
| Image storage | Vercel Blob |
| Auth | JWT cookie (jose) |
| Payments | Paymob |
| Hosting | Vercel |

---

## 🚀 Local Development

```bash
# 1. Clone the repo
git clone https://github.com/tarekokasha22/New-Biolumin.git
cd New-Biolumin

# 2. Install dependencies
npm install

# 3. Copy env vars
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, ADMIN_PASSWORD, etc.

# 4. Generate Prisma client + push schema
npx prisma generate
npx prisma db push

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin) — default password is set by `ADMIN_PASSWORD` in your `.env`.

---

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct (non-pooled) connection |
| `ADMIN_PASSWORD` | Admin panel login password |
| `ADMIN_JWT_SECRET` | Secret for signing admin session JWTs |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for image uploads |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NEXT_PUBLIC_INSTAPAY_HANDLE` | InstaPay phone for bank transfer |
| `NEXT_PUBLIC_WALLET_NUMBER` | Wallet number shown at checkout |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Customer WhatsApp contact |
| `OWNER_WHATSAPP_NUMBER` | Owner number for order alerts |
| `PAYMOB_API_KEY` | Paymob API key |
| `PAYMOB_HMAC` | Paymob HMAC secret |
| `NEXT_PUBLIC_SHIP_CAIRO` | Cairo shipping fee (EGP) |
| `NEXT_PUBLIC_SHIP_DELTA` | Delta governorates shipping fee |
| `NEXT_PUBLIC_SHIP_CANAL` | Canal zone shipping fee |
| `NEXT_PUBLIC_SHIP_UPPER` | Upper Egypt shipping fee |
| `NEXT_PUBLIC_SHIP_REMOTE` | Remote areas shipping fee |
| `NEXT_PUBLIC_FREE_SHIP_THRESHOLD` | Free shipping above this subtotal |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Storefront (Arabic + English)
│   ├── admin/             # Admin panel
│   │   ├── dashboard/     # Analytics dashboard
│   │   ├── products/      # Products + sorting
│   │   ├── orders/        # Order management
│   │   ├── inventory/     # Stock status
│   │   ├── drops/         # Drop releases
│   │   ├── discounts/     # Discount codes
│   │   ├── reviews/       # Customer reviews
│   │   ├── subscribers/   # Email list
│   │   ├── settings/      # Store settings
│   │   └── business/      # Business tools
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin UI components
│   │   ├── charts/        # SVG chart components
│   │   ├── AdminSidebar   # Collapsible sidebar nav
│   │   ├── KpiCard        # Analytics KPI cards
│   │   └── ProductSortGrid # Drag-and-drop sort grid
│   └── ...                # Storefront components
├── lib/
│   ├── admin-actions.ts   # Server actions
│   ├── admin-analytics.ts # Analytics queries
│   ├── catalog.ts         # Storefront product queries
│   └── ...
└── prisma/
    └── schema.prisma
```

---

*Built with ❤️ for Biolumin — نورك يبان*
