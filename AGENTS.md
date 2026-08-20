# PolyConnect

B2B industrial materials manufacturer website for a Bangladeshi poly packaging/textile raw materials company (HDPE/LDPE bags, BOPP film, yarn). Single-seller site where the company sells directly to B2B buyers (RMG exporters, garment factories).

## Tech Stack

- **Frontend:** React (Vite) with CSS Modules
- **Backend:** Node.js + Express
- **Database:** PostgreSQL with Knex.js (migrations + seeds)
- **Auth:** JWT, role-based access control
- **Language:** JavaScript (ES modules)

## Platform Requirement

Single responsive website — same codebase for desktop browsers and Android mobile browsers. No separate PWA, iOS/Android apps, or platform-specific builds.

## User Roles

1. **buyer** — browse products, place orders/RFQs, bargain on price, track orders
2. **sales** — manage orders/RFQs, respond to bargaining, update order status
3. **quality** — log quality batch data, upload test reports/certifications
4. **owner** — full access: products, staff accounts, analytics, approve quality data

## Core Database Schema

### Products
- id, name, name_bn (Bangla), category, description, description_bn
- images (JSON array of URLs)
- base_specs (JSON — GSM, thickness, tensile_strength, material_composition, varies by category)
- regular_price, wholesale_price_tiers (JSON: [{min_qty, price}])
- regular_moq, wholesale_moq
- is_bargaining_allowed (boolean)
- is_active (boolean)
- created_at, updated_at

### QualityBatches
- id, product_id (FK), batch_date, tested_by (staff_id)
- measured_values (JSON — flexible per product type)
- certification_file_url
- approval_status (pending/approved/rejected)
- visible_to_public (boolean, only true once approved)
- created_at, updated_at

### Orders
- id, buyer_id (FK), product_id (FK)
- purchase_type (enum: regular, wholesale)
- quantity
- status (enum: quote_requested, negotiating, confirmed, in_production, ready, dispatched, cancelled)
- requested_price, current_offer_price, final_agreed_price
- delivery_deadline
- notes
- created_at, updated_at

### NegotiationThreads
- id, order_id (FK)
- status (enum: open, accepted, rejected, countered)
- created_at, updated_at

### NegotiationMessages
- id, thread_id (FK)
- sender_role (enum: buyer, sales, owner)
- sender_id
- offered_price
- note
- created_at

### BuyerAccounts
- id, company_name, contact_person, phone, email (unique)
- password_hash
- address, city, country
- buyer_type (enum: regular, wholesale_preferred)
- verification_status (enum: unverified, pending, verified)
- is_active (boolean)
- created_at, updated_at

### StaffAccounts
- id, name, email (unique), password_hash
- role (enum: sales, quality, owner)
- is_active (boolean)
- created_at, updated_at

## Folder Structure

```
polyconnect/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Card, Modal, etc.
│   │   │   ├── layout/         # Header, Footer, Sidebar, MobileNav
│   │   │   ├── product/        # ProductCard, ProductGrid, SpecTable, QualityBadge
│   │   │   ├── order/          # OrderForm, OrderStatus, NegotiationThread
│   │   │   └── dashboard/      # DashboardLayout, StatsCard, DataTable
│   │   ├── pages/
│   │   │   ├── public/         # Home, ProductCatalog, ProductDetail, About
│   │   │   ├── buyer/          # BuyerDashboard, OrderHistory, RFQForm
│   │   │   ├── staff/          # SalesDashboard, QualityDashboard
│   │   │   ├── admin/          # AdminDashboard, ProductManagement, QualityApproval
│   │   │   └── auth/           # Login, Register
│   │   ├── hooks/              # useAuth, useProducts, useOrders, useLanguage
│   │   ├── context/            # AuthContext, LanguageContext
│   │   ├── services/           # API service functions (axios instance)
│   │   ├── styles/
│   │   │   ├── tokens.css      # CSS custom properties (colors, fonts, spacing)
│   │   │   ├── global.css      # Reset, base styles
│   │   │   └── components/     # Component-specific CSS modules
│   │   ├── utils/              # formatters, validators, helpers
│   │   ├── i18n/               # en.json, bn.json translation files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                 # Static assets (images, favicon)
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js     # Knex config
│   │   │   └── auth.js         # JWT config, secret, expiry
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verify, role check
│   │   │   ├── validate.js     # Request validation
│   │   │   └── upload.js       # Multer for file uploads
│   │   ├── routes/
│   │   │   ├── auth.js         # POST /login, POST /register
│   │   │   ├── products.js     # CRUD + public catalog
│   │   │   ├── orders.js       # CRUD + status updates
│   │   │   ├── negotiations.js # Thread/message endpoints
│   │   │   ├── quality.js      # QualityBatch CRUD + approval
│   │   │   ├── buyers.js       # Buyer account management
│   │   │   └── admin.js        # Admin-only endpoints
│   │   ├── models/             # Knex query builders
│   │   └── utils/              # Email helpers, validators
│   ├── migrations/             # Knex migrations
│   ├── seeds/                  # Seed data (categories, demo products)
│   └── knexfile.js
│
├── .env.example
├── .gitignore
├── package.json                # Root scripts (dev, build, migrate, seed)
└── AGENTS.md
```

## Development Commands

```bash
# Root level
npm run dev          # Start both client and server (concurrently)
npm run dev:client   # Start Vite dev server only
npm run dev:server   # Start Express server only
npm run build        # Build client for production
npm run migrate      # Run Knex migrations
npm run migrate:rollback  # Rollback last migration
npm run seed         # Run seed files
npm run lint         # ESLint check
npm run typecheck    # Not yet — add if TypeScript introduced later

# Server only
cd server && npm run dev

# Client only
cd client && npm run dev
```

## Design System Tokens

```css
/* Colors */
--ink-navy: #0B1F3A;        /* Headers, footer, primary text */
--resin-blue: #1E4E79;      /* Nav, section backgrounds, headings */
--poly-sheen: #2F86EB;      /* CTAs, links, active states, highlights */
--frost-white: #EAF2FB;     /* Section backgrounds, cards */
--slate-gray: #55636F;      /* Body text */
--paper-white: #FAFBFC;     /* Page background */

/* Typography */
--font-display: 'Space Grotesk', sans-serif;  /* Headlines */
--font-body: 'Inter', sans-serif;              /* Body copy */
--font-mono: 'IBM Plex Mono', monospace;       /* Specs, data, pricing */

/* Signature Visual */
/* Hero: layered semi-transparent panels (frost-white + poly-sheen)
   with blur/blend suggesting stacked poly film rolls.
   Live spec readout in monospace over the effect. */
```

## Pages

1. **Home** — Hero with layered-film effect, value proposition, featured categories, trust signals
2. **Product Catalog** — Filterable grid, cards with monospace spec strip
3. **Product Detail** — Full specs table (mono), quality batch history, pricing tiers, RFQ/Order CTA
4. **About/Certifications** — Business registration, trade license, quality certs, company story
5. **RFQ/Order Form** — Purchase type toggle, quantity, price proposal, delivery needs
6. **Buyer Dashboard** — Order history, status tracker, negotiation thread view
7. **Admin/Staff Dashboard** — Product management, quality batch entry, order/negotiation management

## Phase 1 MVP Scope

1. Public product catalog — browse/filter by category, view specs + approved quality data
2. Product detail page — regular price + MOQ, wholesale price tiers + MOQ, live quality batch
3. RFQ/Order form — purchase type, quantity, delivery need, optional price proposal (bargaining)
4. Basic admin panel — add/edit products, view incoming orders/RFQs
5. Email notification to admin when new order/RFQ comes in

## Critical Constraints

- Mobile-first responsive — many users on mid-range Android phones over 3G/4G
- Bilingual-ready (EN/BN) — Bangla text runs longer, design with flexible spacing
- High contrast — factory-floor outdoor/bright-light phone usage
- Page weight ~1.5MB max for slow connections
- Public pages must never expose cost basis, negotiation floor prices, or internal data
- Bargaining UI: structured offer → counter → accept, NOT free-form chat
- No generic AI design — no cream/terracotta, no black/neon, no hairline-newspaper layouts
- Industrial, precise, trustworthy aesthetic — like a real materials manufacturer

## Environment Variables

```
# .env.example
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/polyconnect
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

## Git Conventions

- Branch naming: `feature/`, `fix/`, `chore/`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PR requires review before merge (if team workflow established)

## Key Notes for Agents

- **Always check product category before writing specs** — base_specs JSON structure varies by category (HDPE bags vs BOPP film vs yarn have different measurement fields)
- **Quality batches require approval** — never auto-publish; quality staff submits → admin approves → visible_to_public becomes true
- **Negotiation is async** — not real-time chat; offer/counter-offer structured messages tied to an order
- **Pricing has two modes** — regular (single price + MOQ) and wholesale (tiered pricing + MOQ); buyer selects which mode when placing order
- **Admin sees cost data, buyers never do** — public API responses must filter out internal pricing/cost fields
