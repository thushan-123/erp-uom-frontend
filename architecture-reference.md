# Architecture Reference — Multi-Tenant ERP (Django Ninja + Next.js)

## Stack

- Backend: Django + Django Ninja, clean architecture (`domain` / `application` / `infrastructure` / `interfaces` per app)
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, React Hook Form + Zod
- Multi-tenancy: database-per-tenant, subdomain-based
- Auth: JWT access+refresh pair, Valkey-backed revocation

## Multi-tenancy

Two Django apps, split by database via a custom `TenantDatabaseRouter` (driven by `settings.PLATFORM_APP_LABELS` / `settings.TENANT_APP_LABELS`):

- `apps.core` — shared/platform db (`"default"`). Tenant-agnostic catalog data.
- `apps.administration` — per-tenant db. Everything scoped to one tenant.

`Deployment` (`apps.core`) represents one tenant instance: `subdomain`, `db_engine`, `db_name`/`db_host`/`db_port`, `db_alias` property, `is_provisioned`, `suspended_at`.

---

## Backend folder structure

```
apps/
  core/                                  # shared db
    domain/
      models/
        deployment.py                    # Deployment — tenant instance + db connection info
        module.py                        # Module — purchasable product module (IMS, Finance, ...)
        module_menu.py                   # ModuleMenu — the menu tree (parent/children, uri, svg)
        activity.py                      # Activity — action types (view/create/edit/delete)
        menu_activity.py                 # MenuActivity — menu × activity, the actual permission unit
        deployment_module.py             # DeploymentModule — which modules a tenant purchased
    infrastructure/
      tenant_context.py                  # get_tenant_db() — resolves current tenant db alias
      db_router.py                       # TenantDatabaseRouter

  administration/                        # per-tenant db
    domain/
      models/
        user_profile.py                  # UserProfile — the only user model the API auths against
        company.py                       # Company — per-tenant companies
        role_type.py                     # RoleType
        role_type_menu.py                # RoleTypeMenu — role -> menu_activity_id grants
        user_company.py                  # UserCompany — user + company + role_type membership
        user_company_menu.py             # UserCompanyMenu — per-user overrides on top of role
      managers.py                        # UserProfileManager
    application/
      services/
        auth_service.py                  # TenantAuthService — login/refresh/logout/logout_all
        capability_service.py            # CapabilityService — get_user_navigation, permission checks
    interfaces/
      schemas/
        auth_schemas.py                  # TenantLoginInput, TokenPairOutput, CurrentUserResponse, ...
        navigation_schemas.py            # NavigationMenuItem, NavigationTreeResponse
      routers/
        auth_router.py                   # POST /auth/login, /refresh, /logout, /logout-all, GET /auth/me
        navigation_router.py             # GET /navigation/tree
      security/
        tenant_auth_bearer.py            # TenantAuthBearer — Ninja HttpBearer auth class
```

---

## Domain model reference

**Shared db (`apps.core`)**
- `Module` — `app_label` (unique), `version_no`, `sequence_no`
- `ModuleMenu` — `module` FK, `parent` FK (self, nullable), `code`, `uri`, `svg`, `sequence_no`
- `Activity` — `code` (unique), `svg`, `sequence_no`
- `MenuActivity` — `menu` FK, `activity` FK, `slug` (auto: `{module.app_label}.{menu.code}.{activity.code}`)
- `DeploymentModule` — `module` FK, `instance` (Deployment) FK, `purchased_at`, `expires_at`, `is_expired` property

**Tenant db (`apps.administration`)**
- `UserProfile` — `username`, `email`, `fullname`, `display_name`, `is_tenant_admin`, `is_super_admin`, password/lockout/2FA fields
- `Company` — `code` (auto-generated), `registration_no`, `tax_id`, `currency`
- `RoleType` — `code` (unique)
- `RoleTypeMenu` — `role_type` FK, `menu_activity_id` (bare UUID, cross-db reference into shared db's `MenuActivity`)
- `UserCompany` — `user` FK, `company` FK, `role_type` FK, `is_default_company`
- `UserCompanyMenu` — `user_company` FK, `menu_activity_id` (same cross-db pattern)

---

## Permission model

Two gates, both computed server-side:

1. **Licensing gate** — is the module in `DeploymentModule` for this tenant (active, not expired)?
2. **Permission gate** — does the user have the `view` `Activity` on this menu, via `RoleTypeMenu` or `UserCompanyMenu`, aggregated across **all** companies the user belongs to (no global "active company" concept)?

Company only enters the picture at the point of a specific action inside a feature (e.g. picking which company to add a Business Partner to) — a separate, live, per-company check, not part of the aggregate navigation tree.

Disabled items (either gate) render visible-but-not-clickable, labeled "Locked."

---

## Frontend folder structure

```
app/
  login/page.tsx                         # login form (RHF + Zod)
  (dashboard)/
    layout.tsx                           # fetches user + nav tree, wraps NavigationProvider + AppShell
    page.tsx                             # dashboard home (cards, chart, data table)
    business-partner/page.tsx            # example feature page
  api/
    auth/login/route.ts                  # BFF: calls Django /auth/login, sets httpOnly cookies
    auth/refresh/route.ts                # BFF: rotates token pair
    auth/logout/route.ts                 # BFF: revokes session, clears cookies
    tenant/[...path]/route.ts            # catch-all proxy: client components -> Bearer-authed Django calls

middleware.ts                            # silent token refresh before protected pages render

lib/
  auth/
    cookies.ts                           # cookie names, options, JWT-exp helper
    subdomain.ts                         # derives tenant subdomain from host
  api/
    server-fetch.ts                      # authenticated fetch for Server Components (reads cookie -> Bearer)
    navigation.ts                        # getNavigationTree, getCurrentUser, getMyCompanies, checkCompanyPermission
  types/navigation.ts                    # mirrors backend Ninja schemas
  schemas/
    auth.ts                              # login form Zod schema
    business-partner.ts                  # example form Zod schema
  stores/
    navigation-store.ts                  # Zustand store FACTORY (per-request, avoids cross-tenant leak)
    company-selection-store.ts           # Zustand singleton (client-only interaction state)
  sidebar-colors.ts                      # per-module accent color assignment

components/
  providers/navigation-provider.tsx      # creates the per-request store, exposes useNavigation/usePermission
  layout/
    app-shell.tsx                        # SidebarProvider + AppSidebar + SidebarInset + TopBar
    app-sidebar.tsx                      # renders ModuleGroup per module
    module-group.tsx                     # one module's collapsible section (own open/close state)
    nav-item.tsx                         # menu item / nested item, active + disabled states
    top-bar.tsx                          # sidebar trigger, search, notifications, fullscreen, user menu
    user-menu.tsx                        # user dropdown (profile, logout)
    fullscreen-toggle.tsx                # Fullscreen API toggle
    menu-icon.tsx                        # renders svg markup or fallback icon
  forms/
    business-partner-form-dialog.tsx     # RHF + Zod + company-scoped permission check pattern
  dashboard/
    section-cards.tsx                    # KPI cards
    chart-area-interactive.tsx           # recharts area chart
    partner-activity-table.tsx           # sortable/paginated data table
  ui/                                    # shadcn primitives (sidebar, dialog, form, table, chart, etc.)
```

### Auth flow (BFF pattern)

Django issues a JWT access+refresh pair in the response body. To avoid exposing raw tokens to browser JS:

1. `app/login/page.tsx` posts to `/api/auth/login` (Next.js Route Handler), not Django directly.
2. That handler calls Django, strips the tokens out of the response, sets them as httpOnly cookies.
3. Server Components call Django directly via `server-fetch.ts`, reading the cookie and attaching `Authorization: Bearer`.
4. Client Components call `/api/tenant/[...path]` instead, since they can't read an httpOnly cookie themselves — that proxy reads it server-side and forwards the Bearer header.
5. `middleware.ts` silently rotates the pair before protected pages render, since Server Components can't mutate cookies mid-render.

### State management

- `navigation-store.ts` is a factory, not a singleton — one instance per request via `useRef` in the provider, since a shared module-level store would leak one tenant's data into another tenant's request.
- `company-selection-store.ts` is a plain singleton — pure client interaction state, no per-request data involved.

### Dependency notes

- `@tanstack/react-table` pinned to `^8` (v9 installs by default and is a different API).
- Tailwind v4 — CSS-first config (`@theme inline` in `globals.css`), no `tailwind.config.ts`.
