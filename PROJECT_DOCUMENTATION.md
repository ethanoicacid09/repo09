# ZenHerb — Full-Stack E-Commerce Application

## Complete Project Documentation (College Project Guide)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack Explained](#2-tech-stack-explained)
3. [Folder Structure Explained](#3-folder-structure-explained)
4. [Database Design (Schema)](#4-database-design-schema)
5. [Authentication System](#5-authentication-system)
6. [How Routing Works (App Router)](#6-how-routing-works-app-router)
7. [Store (Customer) Module](#7-store-customer-module)
8. [Admin Module](#8-admin-module)
9. [Cart System (State Management)](#9-cart-system-state-management)
10. [Checkout & Order Flow](#10-checkout--order-flow)
11. [Stripe Payment Integration](#11-stripe-payment-integration)
12. [Middleware & Route Protection](#12-middleware--route-protection)
13. [Server Actions (Backend Logic)](#13-server-actions-backend-logic)
14. [UI Component Library](#14-ui-component-library)
15. [Environment Variables](#15-environment-variables)
16. [How to Run the Project](#16-how-to-run-the-project)
17. [Key Concepts for Viva/Interview](#17-key-concepts-for-vivainterview)
18. [ER Diagram (Text)](#18-er-diagram-text)
19. [Data Flow Diagrams](#19-data-flow-diagrams)
20. [Common Viva Questions & Answers](#20-common-viva-questions--answers)

---

## 1. Project Overview

**ZenHerb** is a full-stack e-commerce web application for selling herbs, yoga essentials, supplements, and wellness products. It includes:

- **Customer-facing store** — Browse products, view categories, add to cart, checkout
- **Admin dashboard** — Manage products, categories, orders, view stats
- **Authentication** — Sign up with email/password or Google OAuth
- **Payment processing** — Stripe integration for secure checkout
- **Responsive design** — Works on mobile, tablet, and desktop

### What Problem Does It Solve?

It provides a complete online shopping platform where customers can discover herbal/wellness products and purchase them securely, while administrators can manage inventory and track orders — all through a single web application.

---

## 2. Tech Stack Explained

| Technology | Purpose | Why It's Used |
|---|---|---|
| **Next.js 16** | Full-stack React framework | Handles both frontend (UI) and backend (API routes, server actions) in one project |
| **React 19** | UI library | Builds interactive user interfaces with reusable components |
| **TypeScript** | Programming language | JavaScript with types — catches bugs before runtime |
| **Tailwind CSS 4** | Styling | Utility-first CSS — write styles directly in HTML classes |
| **PostgreSQL** (NeonDB) | Database | Stores all data (users, products, orders). Neon = serverless Postgres |
| **Drizzle ORM** | Database toolkit | Write database queries in TypeScript instead of raw SQL |
| **NextAuth.js v5** | Authentication | Handles login, signup, sessions, Google OAuth |
| **Stripe** | Payment gateway | Processes credit/debit card payments securely |
| **Zustand** | State management | Manages the shopping cart on the client side |
| **Zod v4** | Validation | Validates form inputs (email format, password length, etc.) |
| **shadcn/ui** | Component library | Pre-built, customizable UI components (buttons, cards, dialogs) |
| **Lucide React** | Icons | SVG icon library used throughout the UI |
| **pnpm** | Package manager | Faster, disk-efficient alternative to npm |

### How They Work Together

```
User's Browser (React + Tailwind + Zustand)
        ↓ HTTP requests
Next.js Server (API routes + Server Actions + Server Components)
        ↓ Drizzle ORM queries
PostgreSQL Database (NeonDB - cloud hosted)
        ↓ Stripe API calls
Stripe Payment Gateway
```

---

## 3. Folder Structure Explained

```
repo09/
├── public/                     # Static files (images, favicon)
├── src/                        # All source code lives here
│   ├── auth.ts                 # Authentication configuration (NextAuth)
│   ├── middleware.ts            # Route protection (runs before every request)
│   ├── app/                    # Next.js App Router (pages & API routes)
│   │   ├── layout.tsx          # Root layout (wraps entire app)
│   │   ├── globals.css         # Global styles
│   │   ├── not-found.tsx       # Custom 404 page
│   │   ├── (store)/            # Customer-facing pages (parentheses = route group)
│   │   │   ├── page.tsx        # Homepage (/)
│   │   │   ├── layout.tsx      # Store layout (header + footer)
│   │   │   ├── products/       # Product listing & detail pages
│   │   │   ├── cart/           # Shopping cart page
│   │   │   ├── checkout/       # Checkout flow
│   │   │   └── account/        # User account & order history
│   │   ├── (admin)/            # Admin dashboard pages
│   │   │   └── admin/
│   │   │       ├── page.tsx    # Dashboard with stats
│   │   │       ├── products/   # CRUD for products
│   │   │       ├── categories/ # CRUD for categories
│   │   │       └── orders/     # Order management
│   │   ├── (auth)/             # Login & signup pages
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   └── api/                # API routes
│   │       ├── auth/           # NextAuth API handler
│   │       └── stripe/         # Stripe webhook endpoint
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base components (button, card, input, etc.)
│   │   ├── store/              # Store-specific (header, footer, product card)
│   │   ├── admin/              # Admin-specific (sidebar, stats card)
│   │   └── shared/             # Shared (auth provider, theme toggle)
│   └── lib/                    # Utility/helper files
│       ├── db.ts               # Database connection
│       ├── schema.ts           # Database table definitions
│       ├── seed.ts             # Script to populate DB with sample data
│       ├── stripe.ts           # Stripe client setup
│       ├── hash.ts             # Password hashing utility
│       ├── utils.ts            # General utilities (className merger)
│       ├── validators.ts       # Zod validation schemas
│       └── stores/
│           └── cart-store.ts   # Zustand cart state
├── drizzle.config.ts           # Drizzle ORM configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── .env.local                  # Environment variables (secrets)
```

### What Are Route Groups `(parentheses)`?

In Next.js App Router, folders wrapped in parentheses like `(store)`, `(admin)`, `(auth)` are **route groups**. They:
- **Do NOT affect the URL** — `(store)/products/page.tsx` maps to `/products`, not `/store/products`
- **Allow different layouts** — The store has a header/footer, admin has a sidebar, auth pages are centered

---

## 4. Database Design (Schema)

The database has **10 tables** defined in `src/lib/schema.ts` using Drizzle ORM.

### Tables Overview

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | User accounts | id, name, email, hashedPassword, role (customer/admin) |
| `accounts` | OAuth provider accounts (Google) | userId, provider, providerAccountId |
| `sessions` | Active user sessions | sessionToken, userId, expires |
| `verification_tokens` | Email verification tokens | identifier, token, expires |
| `categories` | Product categories | id, name, slug, description, image |
| `products` | Product catalog | id, name, slug, price, stock, categoryId, isActive, isFeatured |
| `product_images` | Images for products | id, productId, url, alt, displayOrder |
| `addresses` | User shipping addresses | id, userId, street, city, state, postalCode |
| `orders` | Customer orders | id, orderNumber, userId, status, total, shipping details |
| `order_items` | Individual items in an order | id, orderId, productId, name, price, quantity |
| `cart_items` | Server-side cart persistence | id, userId, productId, quantity |

### Relationships

```
users ──┬── 1:N ──→ orders ──── 1:N ──→ order_items
        ├── 1:N ──→ addresses
        ├── 1:N ──→ cart_items
        ├── 1:N ──→ accounts (OAuth)
        └── 1:N ──→ sessions

categories ── 1:N ──→ products ── 1:N ──→ product_images
```

### Key Design Decisions

- **UUIDs as primary keys** — More secure than auto-increment integers (can't guess IDs)
- **Slugs on products/categories** — SEO-friendly URLs (`/products/chamomile-calm-blend` instead of `/products/abc123`)
- **Soft attributes** — `isActive` to hide products without deleting, `isFeatured` for homepage display
- **Denormalized order items** — Product name/price stored in order_items so order history remains accurate even if the product is later changed or deleted
- **Database indexes** — Added on frequently queried columns (categoryId, isActive, userId) for performance

---

## 5. Authentication System

**File:** `src/auth.ts`

The app uses **NextAuth.js v5** (Auth.js) with two login methods:

### Method 1: Email + Password (Credentials Provider)

1. User enters email and password on `/sign-in`
2. Password is hashed using **SHA-256** (Web Crypto API)
3. Hashed password is compared with the stored hash in the database
4. If they match → user is authenticated

### Method 2: Google OAuth

1. User clicks "Sign in with Google"
2. Redirected to Google's consent screen
3. Google returns user info (name, email, profile picture)
4. NextAuth creates/links the user in our database automatically

### Session Strategy: JWT

```
JWT (JSON Web Token) Strategy:
- No sessions stored in DB for every request
- Token stored in an HTTP-only cookie
- Contains: user ID, email, role
- Validated on every request by NextAuth
```

### Role-Based Access

The `users` table has a `role` column with two values:
- **`customer`** — Can browse, purchase, view own orders
- **`admin`** — Can access `/admin` dashboard, manage products/orders

The role is embedded in the JWT token and checked in middleware + layouts.

### Registration Flow (`src/app/(auth)/sign-up/actions.ts`)

```
User fills form → Zod validates input → Check if email exists →
Hash password (SHA-256) → Insert into users table → Redirect to sign-in
```

---

## 6. How Routing Works (App Router)

Next.js App Router uses the **file system** to define routes:

| File Path | URL | What It Renders |
|---|---|---|
| `app/(store)/page.tsx` | `/` | Homepage |
| `app/(store)/products/page.tsx` | `/products` | Product listing |
| `app/(store)/products/[slug]/page.tsx` | `/products/chamomile-calm-blend` | Single product page |
| `app/(store)/cart/page.tsx` | `/cart` | Cart page |
| `app/(store)/checkout/page.tsx` | `/checkout` | Checkout form |
| `app/(store)/account/page.tsx` | `/account` | User profile |
| `app/(store)/account/orders/page.tsx` | `/account/orders` | Order history |
| `app/(auth)/sign-in/page.tsx` | `/sign-in` | Login page |
| `app/(auth)/sign-up/page.tsx` | `/sign-up` | Registration page |
| `app/(admin)/admin/page.tsx` | `/admin` | Admin dashboard |
| `app/(admin)/admin/products/page.tsx` | `/admin/products` | Product management |
| `app/(admin)/admin/categories/page.tsx` | `/admin/categories` | Category management |
| `app/(admin)/admin/orders/page.tsx` | `/admin/orders` | Order management |
| `app/(admin)/admin/orders/[id]/page.tsx` | `/admin/orders/abc123` | Single order detail |

### Dynamic Routes `[slug]` and `[id]`

Square brackets mean the segment is **dynamic** — it matches any value:
- `/products/[slug]` → matches `/products/yoga-mat`, `/products/green-tea`, etc.
- `/admin/orders/[id]` → matches `/admin/orders/any-uuid-here`

The dynamic value is passed as a prop: `params.slug` or `params.id`.

### Server Components vs Client Components

| Type | Rendered On | Can Do | Marker |
|---|---|---|---|
| **Server Component** (default) | Server | Fetch data, access DB, read files | No marker needed |
| **Client Component** | Browser | Use state, effects, event handlers | `"use client"` at top of file |

**Example:** The homepage `(store)/page.tsx` is a Server Component — it queries the database directly. But the "Add to Cart" button is a Client Component because it needs `onClick` handlers and Zustand state.

---

## 7. Store (Customer) Module

### Homepage (`/`)
- Hero section with call-to-action buttons
- Featured products grid (fetched from DB where `isFeatured = true`)
- Category showcase
- Trust badges (free shipping, secure payment, etc.)

### Product Listing (`/products`)
- Grid of all active products
- Each product displayed as a `ProductCard` component
- Shows image, name, price, category badge

### Product Detail (`/products/[slug]`)
- Full product information
- Image display
- Price (with optional compare-at/strikethrough price)
- Stock status
- "Add to Cart" button (Client Component)

### Cart (`/cart`)
- Shows all items added to cart
- Quantity adjustment (+/-)
- Remove items
- Cart total calculation
- Proceed to checkout

### Checkout (`/checkout`)
- Shipping address form (validated with Zod)
- Order summary
- Place order (creates order in database)
- Redirects to success page

### Account (`/account`)
- User profile info
- Order history with status tracking

---

## 8. Admin Module

**Protected route** — Only users with `role: "admin"` can access `/admin/*`.

### Dashboard (`/admin`)
- **Stats cards:** Total revenue (₹), order count, product count, customer count
- **Recent orders table:** Last 10 orders with status badges
- Stats are calculated using SQL aggregation queries (`SUM`, `COUNT`)

### Product Management (`/admin/products`)
- List all products (table view)
- **Create** new product (`/admin/products/new`)
- **Edit** existing product (`/admin/products/[id]/edit`)
- Product form includes: name, description, category, price, compare price, SKU, stock, active/featured toggles, image URL
- Auto-generates URL slug from product name

### Category Management (`/admin/categories`)
- List, create, and manage categories
- Each category has: name, slug, description, image

### Order Management (`/admin/orders`)
- View all orders
- View order details (`/admin/orders/[id]`)
- **Update order status:** pending → processing → shipped → delivered (or cancelled)

---

## 9. Cart System (State Management)

**File:** `src/lib/stores/cart-store.ts`

The cart uses **Zustand** — a lightweight state management library.

### How It Works

```typescript
// The cart store provides:
items: CartItem[]           // Array of items in cart
addItem(item)               // Add product to cart (or increment quantity)
removeItem(productId)       // Remove product from cart
updateQuantity(id, qty)     // Change quantity of an item
clearCart()                 // Empty the cart
totalItems()                // Get total item count
totalPrice()                // Get total price
```

### Persistence

The cart uses Zustand's `persist` middleware with `localStorage`:
- Cart data survives page refreshes
- Cart data survives browser tabs
- Stored under the key `"zenherb-cart"` in browser's localStorage

### Why Zustand Over Redux?

| Feature | Zustand | Redux |
|---|---|---|
| Boilerplate | Minimal | Heavy (actions, reducers, store setup) |
| Bundle size | ~1KB | ~7KB+ |
| Learning curve | Low | Steep |
| For this project | Perfect fit | Overkill |

---

## 10. Checkout & Order Flow

### Complete Flow (Step by Step)

```
1. Customer browses products and adds to cart (Zustand store)
        ↓
2. Customer navigates to /cart, reviews items
        ↓
3. Clicks "Checkout" → redirected to /checkout (middleware checks auth)
        ↓
4. If not logged in → redirected to /sign-in?callbackUrl=/checkout
        ↓
5. Fills shipping address form (validated by Zod's addressSchema)
        ↓
6. Clicks "Place Order" → calls Server Action `createCheckoutSession`
        ↓
7. Server Action:
   a. Verifies user is authenticated
   b. Calculates subtotal, shipping ($0 if over ₹2000), total
   c. Generates order number (e.g., "ZH-M3K7X2")
   d. Inserts into `orders` table
   e. Inserts each product into `order_items` table
        ↓
8. Redirects to /checkout/success
        ↓
9. Cart is cleared on the client
```

### Order Statuses

```
pending → processing → shipped → delivered
                  ↘ cancelled
```

Each status change is tracked with an `updatedAt` timestamp.

---

## 11. Stripe Payment Integration

### Files Involved

- `src/lib/stripe.ts` — Stripe SDK initialization
- `src/app/api/stripe/webhooks/route.ts` — Webhook endpoint

### How Stripe Webhooks Work

```
1. Customer pays on Stripe Checkout page
        ↓
2. Stripe processes the payment
        ↓
3. Stripe sends a POST request to /api/stripe/webhooks
        ↓
4. Our server verifies the webhook signature (security!)
        ↓
5. On "checkout.session.completed" event:
   a. Look up user by email
   b. Create order in our database
   c. Create order items from Stripe line items
        ↓
6. Return 200 OK to Stripe
```

### Webhook Security

The webhook handler verifies the `stripe-signature` header using a shared secret (`STRIPE_WEBHOOK_SECRET`). This ensures the request genuinely came from Stripe and wasn't forged.

---

## 12. Middleware & Route Protection

**File:** `src/middleware.ts`

Middleware runs **before** every matched request. It's like a security guard at the door.

### What It Protects

| Route Pattern | Rule |
|---|---|
| `/admin/*` | Must be logged in AND have role = "admin" |
| `/account/*` | Must be logged in |
| `/checkout/*` | Must be logged in |
| Everything else | Public access |

### How It Works

```
Request comes in → Middleware runs → Check auth session
    ├── Not logged in? → Redirect to /sign-in?callbackUrl=<original-url>
    ├── Logged in but not admin + accessing /admin? → Redirect to /
    └── All good → Allow request through (NextResponse.next())
```

The `callbackUrl` query parameter ensures that after login, the user is redirected back to where they originally wanted to go.

---

## 13. Server Actions (Backend Logic)

Server Actions are **server-side functions** that can be called directly from React components. They replace traditional API endpoints for form submissions and mutations.

### All Server Actions in This Project

| File | Function | What It Does |
|---|---|---|
| `(auth)/sign-up/actions.ts` | `registerUser()` | Creates new user account |
| `(store)/checkout/actions.ts` | `createCheckoutSession()` | Creates order in DB |
| `(admin)/admin/products/actions.ts` | `saveProduct()` | Creates or updates a product |
| `(admin)/admin/categories/actions.ts` | *(category CRUD)* | Manages categories |
| `(admin)/admin/orders/actions.ts` | `updateOrderStatus()` | Changes order status |

### How Server Actions Work

```typescript
// In the file — mark with "use server"
"use server";

export async function registerUser(input) {
  // This code ONLY runs on the server
  // Can safely access database, secrets, etc.
  const user = await db.insert(users).values({...});
  return { success: true };
}

// In the component — call it like a normal function
const result = await registerUser({ name, email, password });
```

### Security in Server Actions

Every admin action checks the session:
```typescript
const session = await auth();
if (session?.user?.role !== "admin") {
  return { error: "Unauthorized" };
}
```

---

## 14. UI Component Library

The UI is built with **shadcn/ui** — a collection of copy-paste components built on top of Radix UI primitives and styled with Tailwind CSS.

### Components Used

| Component | File | Used For |
|---|---|---|
| Button | `ui/button.tsx` | All buttons (multiple variants: default, outline, ghost) |
| Card | `ui/card.tsx` | Product cards, stats cards |
| Input | `ui/input.tsx` | Form inputs |
| Label | `ui/label.tsx` | Form labels |
| Select | `ui/select.tsx` | Dropdowns (category selection) |
| Dialog | `ui/dialog.tsx` | Modal popups |
| Table | `ui/table.tsx` | Data tables (admin) |
| Badge | `ui/badge.tsx` | Status badges, category tags |
| Sheet | `ui/sheet.tsx` | Slide-out cart drawer |
| Skeleton | `ui/skeleton.tsx` | Loading placeholders |
| Tabs | `ui/tabs.tsx` | Tabbed interfaces |
| Sonner | `ui/sonner.tsx` | Toast notifications |
| Avatar | `ui/avatar.tsx` | User profile pictures |
| Dropdown Menu | `ui/dropdown-menu.tsx` | User menu, action menus |
| Separator | `ui/separator.tsx` | Horizontal lines |
| Checkbox | `ui/checkbox.tsx` | Toggle inputs |
| Textarea | `ui/textarea.tsx` | Multi-line text inputs |

### The `cn()` Utility

```typescript
// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

This function merges CSS class names intelligently — handles conditional classes and resolves Tailwind conflicts (e.g., `p-2` and `p-4` → keeps only `p-4`).

---

## 15. Environment Variables

**File:** `.env.local` (never commit this to Git!)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (NeonDB) |
| `AUTH_SECRET` | Secret key for signing JWT tokens |
| `AUTH_URL` | Base URL of the app (`http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app secret |
| `STRIPE_SECRET_KEY` | Stripe backend API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend key (safe to expose) |
| `NEXT_PUBLIC_URL` | Public app URL |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All others are server-only.

---

## 16. How to Run the Project

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- A NeonDB account (free tier works)
- A Google Cloud project (for OAuth)
- A Stripe account (test mode)

### Step-by-Step

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
#    Copy .env.local and fill in your own values

# 3. Push database schema to NeonDB
npx drizzle-kit push

# 4. Seed the database with sample data
npx tsx src/lib/seed.ts

# 5. Start the development server
pnpm dev

# 6. Open http://localhost:3000
```

### Default Admin Login

After seeding, you can use:
- **Email:** `admin@zenherb.store`
- **Password:** `admin123`

---

## 17. Key Concepts for Viva/Interview

### 1. What is SSR vs CSR?

- **SSR (Server-Side Rendering):** HTML is generated on the server for each request. Used by default in Next.js Server Components. Faster initial load, better SEO.
- **CSR (Client-Side Rendering):** JavaScript runs in the browser to build the UI. Used for interactive elements (`"use client"` components).

### 2. What is an ORM?

**Object-Relational Mapping.** Drizzle ORM lets you interact with the database using TypeScript objects instead of writing raw SQL:

```typescript
// Drizzle ORM (what we write)
const user = await db.select().from(users).where(eq(users.email, "a@b.com"));

// SQL equivalent (what actually runs)
// SELECT * FROM users WHERE email = 'a@b.com';
```

### 3. What is JWT?

**JSON Web Token** — a compact, URL-safe token that contains encoded claims (user ID, role). It's signed with a secret key so it can't be tampered with. The server doesn't need to store session data — the token itself contains everything.

### 4. What is OAuth?

**Open Authorization** — a protocol that lets users log in using an existing account (Google, GitHub, etc.) without sharing their password with our app. Google verifies the user and gives us their profile info.

### 5. What is a Webhook?

A **reverse API call** — instead of us calling Stripe, Stripe calls us. When a payment succeeds, Stripe POSTs to our `/api/stripe/webhooks` endpoint with event details.

### 6. What is Middleware?

Code that runs **between** receiving a request and sending a response. Used for auth checks, redirects, logging. In this project, it protects admin and checkout routes.

### 7. What is Zod?

A **schema validation library**. It defines the shape and rules for data, then validates inputs against those rules:

```typescript
const signUpSchema = z.object({
  name: z.string().min(2),      // Must be at least 2 chars
  email: z.email(),              // Must be valid email format
  password: z.string().min(6),   // At least 6 chars
});

signUpSchema.parse(userInput);   // Throws if invalid
```

### 8. What Are Server Components?

React components that run **only on the server**. They can directly access the database, read files, and fetch data — without sending that code to the browser. This means smaller JavaScript bundles and faster pages.

### 9. What is State Management?

A pattern for managing data that multiple components need to share. The cart needs to be accessible from the header (item count), product pages (add button), cart page (item list), and checkout. Zustand provides a single "store" for this shared state.

---

## 18. ER Diagram (Text)

```
┌─────────────────┐       ┌─────────────────┐
│     USERS        │       │   CATEGORIES    │
├─────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │       │ id (PK, UUID)   │
│ name             │       │ name             │
│ email (UNIQUE)   │       │ slug (UNIQUE)    │
│ hashedPassword   │       │ description      │
│ role (enum)      │       │ image            │
│ createdAt        │       │ createdAt        │
└──────┬──────────┘       └──────┬──────────┘
       │                          │
       │ 1:N                      │ 1:N
       ▼                          ▼
┌─────────────────┐       ┌─────────────────┐
│    ORDERS        │       │   PRODUCTS       │
├─────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │       │ id (PK, UUID)   │
│ orderNumber      │       │ name             │
│ userId (FK)      │       │ slug (UNIQUE)    │
│ status (enum)    │       │ categoryId (FK)  │
│ subtotal         │       │ price            │
│ tax              │       │ compareAtPrice   │
│ shippingCost     │       │ sku (UNIQUE)     │
│ total            │       │ stock            │
│ shipping address │       │ isActive         │
│ stripe IDs       │       │ isFeatured       │
│ createdAt        │       │ createdAt        │
└──────┬──────────┘       └──────┬──────────┘
       │                          │
       │ 1:N                      │ 1:N
       ▼                          ▼
┌─────────────────┐       ┌─────────────────┐
│  ORDER_ITEMS     │       │ PRODUCT_IMAGES   │
├─────────────────┤       ├─────────────────┤
│ id (PK, UUID)   │       │ id (PK, UUID)   │
│ orderId (FK)     │       │ productId (FK)   │
│ productId        │       │ url              │
│ name             │       │ alt              │
│ price            │       │ displayOrder     │
│ quantity         │       └─────────────────┘
│ image            │
└─────────────────┘

       USERS also has:
       ├── 1:N → ACCOUNTS (OAuth providers)
       ├── 1:N → SESSIONS (active sessions)
       ├── 1:N → ADDRESSES (shipping addresses)
       └── 1:N → CART_ITEMS (server-side cart)
```

---

## 19. Data Flow Diagrams

### DFD Level 0 (Context Diagram)

```
                    ┌──────────────┐
   Browse/Buy ───→  │              │ ←─── Manage Products
   View Orders ──→  │   ZenHerb    │ ←─── Manage Orders
   Sign In/Up ──→   │   System     │ ←─── View Dashboard
                    │              │
   Customer ────→   └──────┬───────┘  ←──── Admin
                           │
                    ┌──────▼───────┐
                    │   Database    │
                    │   (NeonDB)    │
                    └──────────────┘
```

### DFD Level 1

```
┌──────────┐    Login/Register     ┌────────────────┐
│ Customer │ ──────────────────→  │ 1.0 Auth        │
│          │ ←── Session/JWT ──── │   Module         │
└────┬─────┘                      └────────────────┘
     │
     │  Browse Products
     ▼
┌────────────────┐   Query    ┌───────────────┐
│ 2.0 Product    │ ─────────→ │   Database     │
│   Catalog      │ ←── Data ── │   (Products,  │
└────┬───────────┘             │   Categories) │
     │                         └───────────────┘
     │  Add to Cart
     ▼
┌────────────────┐
│ 3.0 Cart       │ (Zustand localStorage)
│   Management   │
└────┬───────────┘
     │  Checkout
     ▼
┌────────────────┐  Create Order  ┌───────────────┐
│ 4.0 Checkout   │ ──────────────→│   Database     │
│   & Payment    │                │   (Orders)    │
└────────────────┘                └───────────────┘

┌──────────┐
│  Admin   │
└────┬─────┘
     │  CRUD Operations
     ▼
┌────────────────┐  Read/Write  ┌───────────────┐
│ 5.0 Admin      │ ────────────→│   Database     │
│   Dashboard    │ ←────────────│   (All tables) │
└────────────────┘              └───────────────┘
```

### User Authentication Flow

```
┌────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│ User   │────→│ Sign-In  │────→│ NextAuth │────→│ Database│
│        │     │ Page     │     │ (auth.ts)│     │        │
└────────┘     └──────────┘     └─────┬────┘     └────────┘
                                      │
                    ┌─────────────────┤
                    ▼                  ▼
              ┌──────────┐      ┌──────────┐
              │ Credentials│    │  Google   │
              │ (email+pw)│    │  OAuth    │
              └──────────┘      └──────────┘
                    │                  │
                    ▼                  ▼
              ┌──────────────────────────┐
              │   JWT Token Created      │
              │   (contains id + role)   │
              │   Stored in Cookie       │
              └──────────────────────────┘
```

---

## 20. Common Viva Questions & Answers

### Q1: What is Next.js and why did you use it?
**A:** Next.js is a React framework for building full-stack web applications. We used it because it provides server-side rendering for fast page loads and SEO, file-based routing for easy page creation, API routes for backend logic, and server actions for form handling — all in one framework.

### Q2: What database are you using and why?
**A:** PostgreSQL hosted on NeonDB (serverless). PostgreSQL is a robust relational database ideal for e-commerce because it supports ACID transactions (important for order processing), complex queries, and has strong data integrity features. NeonDB provides a free serverless tier that scales automatically.

### Q3: How do you handle authentication?
**A:** We use NextAuth.js v5 (Auth.js) which supports multiple login methods. Users can sign in with email/password (Credentials provider) or Google OAuth. Sessions are managed using JWT tokens stored in HTTP-only cookies. The JWT contains the user's ID and role, which is checked on every request.

### Q4: How is the admin panel secured?
**A:** Three layers of security: (1) Middleware checks auth and role before the page even loads. (2) The admin layout component re-verifies the session and redirects non-admins. (3) Every server action checks the user's role before performing any operation.

### Q5: Explain the cart implementation.
**A:** The cart uses Zustand (client-side state management) with localStorage persistence. When a user adds an item, it's stored in the browser's localStorage under the key "zenherb-cart". The store provides functions to add, remove, update quantity, and calculate totals. This approach works without authentication and survives page refreshes.

### Q6: What is Drizzle ORM?
**A:** Drizzle is a TypeScript ORM (Object-Relational Mapper) that lets us define database tables as TypeScript objects and write queries using TypeScript methods instead of raw SQL. It provides type safety (the compiler catches wrong column names), auto-completion, and generates SQL migrations.

### Q7: How does the checkout process work?
**A:** The customer adds items to cart → proceeds to checkout (must be logged in) → fills shipping details → the server action calculates totals → creates an order record in the database → creates order item records → redirects to success page.

### Q8: What is Zod and why is it important?
**A:** Zod is a TypeScript-first validation library. It's critical for security — we validate all user inputs (forms, API requests) on the server side to prevent SQL injection, XSS, and invalid data. For example, the signup form validates email format and minimum password length.

### Q9: How do you handle images?
**A:** Product images are stored as URLs (hosted on Unsplash in development). Next.js's `<Image>` component optimizes them automatically — resizing, lazy loading, and converting to modern formats (WebP). The `next.config.ts` allowlists the `images.unsplash.com` domain.

### Q10: What are the different layouts in your app?
**A:** Three layouts using Next.js route groups: (1) **Store layout** — has a navigation header and footer for customers. (2) **Admin layout** — has a sidebar navigation for dashboard. (3) **Auth layout** — centered card design for sign-in/sign-up pages.

### Q11: What is the role of middleware in your project?
**A:** Middleware (`src/middleware.ts`) runs before every request that matches `/admin/*`, `/account/*`, or `/checkout/*`. It checks if the user is logged in and has the right role. Unauthenticated users are redirected to sign-in. Non-admin users trying to access /admin are redirected to the homepage.

### Q12: How does Stripe payment work?
**A:** Stripe handles payment securely — our server never sees credit card numbers. The flow: create a Stripe Checkout Session → redirect user to Stripe's hosted payment page → after payment, Stripe calls our webhook endpoint → we verify the payment and create the order. This is PCI-compliant by design.

### Q13: What is the difference between `"use server"` and `"use client"`?
**A:** `"use server"` marks a function as a Server Action — it runs only on the server and can safely access databases and secrets. `"use client"` marks a component as a Client Component — it runs in the browser and can use hooks (useState, useEffect), event handlers, and browser APIs.

### Q14: How is the project deployed?
**A:** The project can be deployed on Vercel (one-click deploy from GitHub). Vercel automatically builds the Next.js app, sets up serverless functions for API routes and server actions, and connects to NeonDB. Environment variables are configured in Vercel's dashboard.

### Q15: What security measures are implemented?
**A:** (1) Password hashing (SHA-256). (2) JWT-based sessions with HTTP-only cookies. (3) Server-side input validation with Zod. (4) Role-based access control in middleware + server actions. (5) Stripe webhook signature verification. (6) UUID primary keys (non-guessable). (7) Environment variables for secrets (never hardcoded).

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────┐
│                    ZENHERB QUICK REFERENCE              │
├────────────────────────────────────────────────────────┤
│ Framework:    Next.js 16 (App Router)                  │
│ Language:     TypeScript                                │
│ Database:     PostgreSQL (NeonDB, serverless)           │
│ ORM:          Drizzle ORM                              │
│ Auth:         NextAuth.js v5 (JWT + Google OAuth)      │
│ Payments:     Stripe (webhooks)                         │
│ Styling:      Tailwind CSS 4 + shadcn/ui               │
│ State Mgmt:   Zustand (cart)                           │
│ Validation:   Zod v4                                    │
│ Package Mgr:  pnpm                                     │
│ Tables:       10 (users, products, orders, etc.)        │
│ User Roles:   customer, admin                          │
│ Key Ports:    localhost:3000 (dev server)               │
└────────────────────────────────────────────────────────┘
```

---

*Document generated for ZenHerb e-commerce project — College project preparation guide.*
