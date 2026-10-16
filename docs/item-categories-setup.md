# Item Categories Setup & Developer Reference Guide

This guide documents the database architecture, environment configuration, migration sequences, seeding workflows, and API contract for the **Item Categories** (Main / Sub categories with independent number series) feature in NexOne ERP.

---

## 1. Architecture Overview

NexOne ERP employs a **Clean Architecture, Database-per-Tenant** multi-tenant design:

```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
│   (BFF Proxy: /api/tenant/[...path] -> Django Ninja)   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP Bearer Token
┌──────────────────────────▼─────────────────────────────┐
│                 Django Ninja Backend                   │
│               (apps.inventory app)                     │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ (Router: Platform Apps)  │ (Router: Tenant Apps)
┌──────────────▼─────────────┐ ┌──────────▼──────────────┐
│    Shared Platform DB      │ │    Tenant Database      │
│       (PostgreSQL)         │ │   (Microsoft SQL Server)│
│  - Deployment              │ │  - ref_item_category    │
│  - Module & ModuleMenu     │ │  - ref_number_series    │
│  - Activity & RoleType     │ │  - UserProfile, etc.    │
└────────────────────────────┘ └─────────────────────────┘
```

- **Platform Database (PostgreSQL)**:
  Contains platform-wide data including tenant `Deployment` records, purchased modules (`DeploymentModule`), global module navigation catalogs (`Module`, `ModuleMenu`), and capability activities (`Activity`).
- **Tenant Database (Microsoft SQL Server)**:
  Contains tenant-isolated business data. For the Inventory module, this includes:
  - `ref_item_category`: Single table supporting both Main and Sub categories via `parent_category_id`.
  - `ref_number_series`: Independent document numbering sequences per category.

---

## 2. Prerequisites & Driver Installation

### 2.1 Database Engines
1. **PostgreSQL 15+** (Platform database)
2. **Microsoft SQL Server 2019+** (Tenant database)

### 2.2 ODBC Driver 18 for SQL Server
The backend connects to SQL Server using `mssql-django` via `pyodbc`, which requires **ODBC Driver 18 for SQL Server**:

- **Windows**:
  Download and install the official Microsoft installer:
  [ODBC Driver 18 for SQL Server (x64)](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- **Linux (Ubuntu/Debian)**:
  ```bash
  curl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
  curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
  sudo apt-get update
  sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev
  ```
- **macOS**:
  ```bash
  brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
  brew update
  HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install msodbcsql18 unixodbc
  ```

---

## 3. Environment Variables Configuration

### 3.1 Backend (`nexone-erp-backend/backend/.env`)
Create a `.env` file in `nexone-erp-backend/backend/.env` (or project root `nexone-erp-backend/.env`):

```env
# Core Django
APP_ENV=development
SECRET_KEY=django-insecure-your-development-secret-key-min-50-chars
DEBUG=True
ALLOWED_HOSTS=["localhost", "127.0.0.1", "demo.localhost"]
DB_LOG_LEVEL=INFO

# Tenant & Domain Routing
TENANT_BASE_DOMAIN=localhost
URL_PROTOCOL=http

# Core Platform Database (PostgreSQL)
CORE_DB_NAME=nexone_platform
CORE_DB_USER=postgres
CORE_DB_PASSWORD=your_postgres_password
CORE_DB_HOST=localhost
CORE_DB_PORT=5432
CORE_DB_CONN_MAX_AGE=360

# Tenant Database Provisioning Settings (Microsoft SQL Server)
TENANT_DB_ADMIN_USER=sa
TENANT_DB_ADMIN_PASSWORD=your_mssql_password
TENANT_DB_DEFAULT_DB=master
TENANT_DB_HOST=localhost
TENANT_DB_PORT=1433
TENANT_DB_PREFIX=tenant_
TENANT_DB_USER_PREFIX=_user

# Valkey / Redis
VALKEY_URL=redis://localhost:6379/1
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3
TENANT_CACHE_TTL=3600
VALKEY_KEY_PREFIX=nexone

# S3 / MinIO
S3_REGION_NAME=us-east-1
S3_SIGNATURE_VERSION=s3v4
S3_ADDRESSING_STYLE=auto
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_KEY=minioadmin
S3_STORAGE_BUCKET_NAME=nexone-media
S3_DEFAULT_ACL=public-read
S3_FILE_OVERWRITE=False
S3_QUERYSTRING_AUTH=True
S3_QUERYSTRING_EXPIRES=3600
```

### 3.2 Frontend (`nexone/.env.local`)
Create `.env.local` in `nexone/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK=false
BACKEND_URL=http://localhost:8000/api/v1
MOCK_PATH_PREFIXES=/inventory/items,/inventory/lookups
```

> **Note on Item Details**:
> `MOCK_PATH_PREFIXES` routes `/inventory/items` and `/inventory/lookups` to mock handlers so the Item Details master continues to work without changes. Once `ref_item` is implemented in a future release, simply remove `/inventory/items` from this variable and point the Item Details category dropdown to `/inventory/item-categories/main-options`.

---

## 4. Database Setup & Execution Commands

### Step 1: Create the Physical Databases
1. In PostgreSQL, create the platform database:
   ```sql
   CREATE DATABASE nexone_platform;
   ```
2. In SQL Server, create the demo tenant database:
   ```sql
   CREATE DATABASE tenant_demo;
   ```

### Step 2: Run Platform Migrations (Default DB)
Migrates `core`, `contenttypes`, `auth`, `sessions`:
```bash
cd nexone-erp-backend/backend
uv run python manage.py migrate --database=default
```

### Step 3: Seed Platform Modules & Activities
Seeds global modules, menus, activities, and permissions (including `item_categories` under Master Data › Inventory Master Data):
```bash
uv run python manage.py seed_modules
```

### Step 4: Register & Provision the Demo Tenant
Create a `Deployment` record in the platform database for the demo tenant. You can do this via Django shell:
```bash
uv run python manage.py shell
```
```python
from apps.core.models import Deployment
from apps.core.services.tenant_provisioner_service import TenantProvisionerService
from apps.core.services.db import DbConnectionService, DbConfigService

deployment, _ = Deployment.objects.update_or_create(
    subdomain="demo",
    defaults={
        "company_name": "Demo Corporation",
        "db_host": "localhost",
        "db_port": 1433,
        "db_name": "tenant_demo",
        "db_user": "sa",
        "db_password": "your_mssql_password",
        "db_alias": "tenant_demo",
        "is_active": True,
    }
)
```

### Step 5: Migrate the Tenant Database
Apply tenant migrations (`administration`, `master_data`, `inventory`) to the tenant database:
```bash
# Register connection and run migrations
uv run python manage.py migrate --database=tenant_demo
```
Verify that `ref_item_category` and `ref_number_series` tables are created in `tenant_demo`:
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN ('ref_item_category', 'ref_number_series');
```

### Step 6: Create the Demo Tenant Admin User
In Django shell:
```python
from apps.administration.models import UserProfile, RoleType
from apps.core.models import Activity

# Switch to tenant db context
role, _ = RoleType.objects.using("tenant_demo").get_or_create(
    name="Administrator",
    role_type="ADMIN",
    is_active=True
)

user, _ = UserProfile.objects.using("tenant_demo").update_or_create(
    username="admin",
    defaults={
        "email": "admin@nexone.internal",
        "fullname": "Admin User",
        "preferred_name": "Admin User",
        "is_tenant_admin": True,
        "is_active": True,
    }
)
user.set_password("admin123")
user.save(using="tenant_demo")
```

### Step 7: Seed Item Categories Seed Data
Runs the idempotent management command that seeds the 8 reference categories and their independent number series:
```bash
uv run python manage.py seed_item_categories --subdomain=demo
```

Categories created:
- Main: `FOOD` (Food, prefix FD, start 200001), `BEV` (Beverages, prefix BEV, start 100001), `BAK` (Bakery, prefix BAK, start 300001)
- Sub: `SNACK` (Snacks → FOOD, prefix SNK, start 1), `DAIRY` (Dairy Products → FOOD, prefix DRY, start 1), `SOFT` (Soft Drinks → BEV, prefix SFT, start 1), `JUICE` (Juices → BEV, prefix JCE, start 1), `BREAD` (Bread → BAK, prefix BRD, start 1)

### Step 8: Run Automated Tests
Execute the full automated test suite verifying category hierarchies, series independence, delete guards, and number allocation:
```bash
uv run python manage.py test apps.inventory.tests --settings=config.settings.test
```

### Step 9: Start the Servers
- **Backend**:
  ```bash
  uv run python manage.py runserver 8000
  ```
- **Frontend**:
  ```bash
  cd nexone
  pnpm dev
  ```
  Open `http://localhost:3000` (or `http://demo.localhost:3000`), log in with `admin` / `admin123`, and navigate to **Inventory › Master Data › Item Categories**.

---

## 5. REST API Contract

All endpoints are mounted under `/api/v1/inventory/item-categories` and require tenant authentication (`Authorization: Bearer <access_token>`).

### 5.1 `GET /inventory/item-categories/summary`
Returns count summary for category stats cards.
- **Activity**: `master_data.item_categories.view`
- **Response `200 OK`**:
  ```json
  {
    "total": 8,
    "main_count": 3,
    "sub_count": 5,
    "items_assigned": 0
  }
  ```

### 5.2 `GET /inventory/item-categories`
List item categories with filtering and pagination.
- **Query Parameters**:
  - `search`: string (case-insensitive search against code, name, parent code, parent name)
  - `level`: `"MAIN"` | `"SUB"`
  - `status`: `"active"` | `"inactive"`
  - `page`: integer (default 1)
  - `page_size`: integer (default 100, max 500)
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "category_id": 1,
        "category_code": "BEV",
        "category_name": "Beverages",
        "category_level": "MAIN",
        "parent_category_id": null,
        "parent_category_code": null,
        "parent_category_name": null,
        "prefix": "BEV",
        "next_number": 100001,
        "items_count": 0,
        "active": true
      }
    ],
    "total": 8,
    "page": 1,
    "page_size": 100
  }
  ```

### 5.3 `GET /inventory/item-categories/main-options`
Returns active Main categories for the Parent dropdown in Sub category creation.
- **Activity**: `master_data.item_categories.view`
- **Response `200 OK`**:
  ```json
  [
    {
      "category_id": 1,
      "category_code": "BEV",
      "category_name": "Beverages"
    }
  ]
  ```

### 5.4 `GET /inventory/item-categories/{category_id}`
Returns category detail including number series and audit information.
- **Activity**: `master_data.item_categories.view`
- **Response `200 OK`**:
  ```json
  {
    "category_id": 1,
    "category_code": "BEV",
    "category_name": "Beverages",
    "category_level": "MAIN",
    "parent_category_id": null,
    "parent_category_code": null,
    "parent_category_name": null,
    "prefix": "BEV",
    "next_number": 100001,
    "items_count": 0,
    "active": true,
    "description": "",
    "number_series": {
      "series_code": "ITEM_MAIN_BEV",
      "scope_type": "CATEGORY_MAIN",
      "prefix": "BEV",
      "start_number": 100001,
      "next_number": 100001,
      "number_length": 6,
      "separator": null,
      "active": true
    },
    "audit": {
      "created_by_name": "Admin User",
      "created_at": "2026-10-02T04:28:18Z",
      "modified_by_name": "Admin User",
      "modified_at": "2026-10-02T04:28:18Z"
    }
  }
  ```

### 5.5 `POST /inventory/item-categories`
Creates a new Main or Sub category along with its independent item number series.
- **Activity**: `master_data.item_categories.create`
- **Request Body**:
  ```json
  {
    "category_code": "SNACK",
    "category_name": "Snacks",
    "category_level": "SUB",
    "parent_category_id": 2,
    "description": "Savory snacks and chips",
    "active": true,
    "number_series": {
      "prefix": "SNK",
      "start_number": 1
    }
  }
  ```
- **Response `201 Created`**: Returns `CategoryDetail` schema.

### 5.6 `PUT /inventory/item-categories/{category_id}`
Updates category details and number series rules (immutable fields like `category_code` and `category_level` are protected).
- **Activity**: `master_data.item_categories.edit`
- **Request Body**:
  ```json
  {
    "category_name": "Snack Foods",
    "parent_category_id": 2,
    "description": "Updated description",
    "active": true,
    "number_series": {
      "prefix": "SNK",
      "start_number": 1,
      "next_number": 5
    }
  }
  ```
- **Response `200 OK`**: Returns `CategoryDetail` schema.

### 5.7 `DELETE /inventory/item-categories/{category_id}`
Deletes category and its associated number series if no items or sub-categories are attached and no numbers have been allocated.
- **Activity**: `master_data.item_categories.delete`
- **Response `204 No Content`**
- **Error `409 Conflict`**: If category has sub-categories, allocated numbers, or assigned items:
  ```json
  {
    "detail": "Cannot delete this Main Category because it has Sub Categories.",
    "code": "category_has_subcategories"
  }
  ```
