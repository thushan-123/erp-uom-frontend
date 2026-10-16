# NexOne ERP — Item Master Data

Real Next.js App Router implementation of the NexOne ERP Item Master Data system, strictly rebuilt from the HTML specification and clean architecture reference.

Built with:
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Base UI preset)
- **State & Forms**: Zustand (per-request store factory), React Hook Form, Zod
- **Data Table**: `@tanstack/react-table` (v8)
- **Notifications**: Sonner toasts + AlertDialog primitives

---

## Mock Mode vs Real Backend

This application is designed with a strict BFF (Backend-for-Frontend) proxy layer and mock router. The presentation and component layer has **zero direct dependency** on mock files.

### Configuration (`.env.local`)

```env
# Set to true for development without a backend, false for production Django backend
NEXT_PUBLIC_USE_MOCK=true

# Django Ninja API Base URL (used when NEXT_PUBLIC_USE_MOCK=false)
BACKEND_URL=http://localhost:8000/api
```

### How the Layer Switch Works

1. **Server Components**: Call `lib/api/*` functions which utilize `serverFetch`.
   - When `NEXT_PUBLIC_USE_MOCK=true`, requests resolve through `lib/mock/index.ts` (with realistic 120ms network latency and state persistence on `globalThis`).
   - When `NEXT_PUBLIC_USE_MOCK=false`, requests are dispatched to `${BACKEND_URL}` with `Authorization: Bearer <token>` retrieved from httpOnly cookies.
2. **Client Components**: Call `clientFetch` targeting the `/api/tenant/[...path]` proxy.
   - The BFF proxy server-side reads httpOnly cookies and routes to either the mock engine or Django Ninja backend.
3. **No Code Changes Required**: Switching from mock to Django Ninja requires changing only the environment variables.

See [`docs/api-contract.md`](./docs/api-contract.md) for the exact REST API contract with JSON payload examples.

---

## Dev-Only Mock Personas

To test multi-tenant licensing and activity permissions:
1. Open the user menu at the top-right (Avatar labeled "AU").
2. Select one of the three personas:
   - **Admin (Full Access)**: Complete permissions across Master Data and Inventory.
   - **Inventory Officer**: Master Data and Inventory unlocked, but Sales Pricing locked.
   - **Sales (View Only)**: Read-only access to Item Details, New/Edit/Delete actions disabled, other inventory modules locked.

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
