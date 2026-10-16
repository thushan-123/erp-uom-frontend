# NexOne ERP — Backend API Contract (Django Ninja)

This document specifies the exact REST API contract implemented by the Next.js frontend (via the mock router and BFF proxy layer). The upcoming Python (Django Ninja) backend must implement these endpoints with identical URL paths, HTTP methods, snake_case schemas, and status codes.

---

## 1. Authentication & Session Endpoints

### 1.1 `POST /auth/login`
Authenticates user credentials and issues an access/refresh token pair.

- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "username": "admin",
      "email": "admin@nexone.internal",
      "fullname": "Admin User",
      "display_name": "Admin User",
      "is_tenant_admin": true,
      "is_super_admin": true,
      "persona": "admin",
      "initials": "AU"
    }
  }
  ```
- **Error `400 Bad Request`**:
  ```json
  {
    "detail": "Username and password required"
  }
  ```

---

### 1.2 `POST /auth/refresh`
Rotates the JWT token pair.

- **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
  ```

---

### 1.3 `POST /auth/logout` & `POST /auth/logout-all`
Revokes session (or all sessions for the user).

- **Response `200 OK`**:
  ```json
  {
    "success": true
  }
  ```

---

### 1.4 `GET /auth/me`
Retrieves currently authenticated user profile.

- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "username": "admin",
    "email": "admin@nexone.internal",
    "fullname": "Admin User",
    "display_name": "Admin User",
    "is_tenant_admin": true,
    "is_super_admin": true,
    "persona": "admin",
    "initials": "AU"
  }
  ```

---

## 2. Navigation & Authorization Endpoints

### 2.1 `GET /navigation/tree`
Returns the hierarchical module and menu tree evaluated against tenant deployment licenses and user permissions.

- **Response `200 OK`**:
  ```json
  {
    "modules": [
      {
        "app_label": "master_data",
        "title": "Master Data",
        "is_locked": false,
        "groups": [
          {
            "title": "Common Master Data",
            "items": [
              {
                "code": "business-partner",
                "title": "Business Partner Master Data",
                "uri": "/master-data/business-partner",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              }
            ]
          },
          {
            "title": "Inventory Master Data",
            "items": [
              {
                "code": "locations",
                "title": "Location Details",
                "uri": "/master-data/locations",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              },
              {
                "code": "item-categories",
                "title": "Item Categories (Main/Sub)",
                "uri": "/master-data/item-categories",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              },
              {
                "code": "inventory-gl-mapping",
                "title": "Inventory G/L Account Mapping",
                "uri": "/master-data/inventory-gl-mapping",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              }
            ]
          }
        ]
      },
      {
        "app_label": "inventory",
        "title": "Inventory",
        "is_locked": false,
        "items": [
          {
            "code": "item-details",
            "title": "Item Details",
            "uri": "/inventory/item-details",
            "is_locked": false,
            "activities": ["view", "create", "edit", "delete"]
          }
        ],
        "groups": [
          {
            "title": "Pricing",
            "items": [
              {
                "code": "sales-pricing",
                "title": "Sales Pricing",
                "uri": "/inventory/sales-pricing",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              },
              {
                "code": "purchase-pricing",
                "title": "Purchase Pricing",
                "uri": "/inventory/purchase-pricing",
                "is_locked": false,
                "activities": ["view", "create", "edit", "delete"]
              }
            ]
          }
        ]
      }
    ]
  }
  ```

---

### 2.2 `GET /companies/mine`
Returns tenant companies the current user has access to.

- **Response `200 OK`**:
  ```json
  [
    {
      "id": "101",
      "code": "101",
      "name": "101 - Alpha",
      "currency": "LKR",
      "is_default": true
    },
    {
      "id": "102",
      "code": "102",
      "name": "102 - Beta",
      "currency": "USD",
      "is_default": false
    },
    {
      "id": "103",
      "code": "103",
      "name": "103 - Gamma",
      "currency": "EUR",
      "is_default": false
    }
  ]
  ```

---

### 2.3 `GET /permissions/check?company_id=&menu=&activity=`
Point-in-time check for specific company action authorization.

- **Query Parameters**:
  - `company_id`: Company ID (e.g. `101`)
  - `menu`: Menu code (e.g. `item-details`)
  - `activity`: `view` | `create` | `edit` | `delete`
- **Response `200 OK`**:
  ```json
  {
    "granted": true,
    "company_id": "101",
    "menu": "item-details",
    "activity": "edit"
  }
  ```

---

## 3. Inventory & Item Master Endpoints

### 3.1 `GET /inventory/lookups`
Returns lookup tables for categories, brands, UOMs, tax codes, currencies, price lists, suppliers, and G/L accounts.

- **Response `200 OK`**:
  ```json
  {
    "main_categories": [
      {
        "code": "CAT1",
        "name": "CAT1 - Flour",
        "sub_categories": ["Food Flour", "Industrial Flour"]
      },
      {
        "code": "CAT2",
        "name": "CAT2 - Beverages",
        "sub_categories": ["Soft Drinks", "Juices"]
      },
      {
        "code": "CAT3",
        "name": "CAT3 - Packaging",
        "sub_categories": ["Boxes", "Bags"]
      }
    ],
    "brands": ["Staff", "Coca Cola", "NexOne"],
    "uom_groups": ["Weight", "Quantity", "Volume"],
    "base_uoms": ["KG", "PCS", "LTR", "BOX", "NOS"],
    "alternate_uoms": ["PCS", "NOS", "BOX", "BAG", "CTN", "KG", "G", "LTR", "ML", "TON"],
    "tax_codes": ["VAT 8%", "VAT 0%", "Exempt"],
    "price_lists": ["Retail", "Wholesale", "VIP", "Export"],
    "currencies": ["LKR", "USD", "EUR"],
    "suppliers": [
      { "id": "SUP001", "name": "ABC Foods", "label": "SUP001 - ABC Foods" },
      { "id": "SUP002", "name": "Global Trading", "label": "SUP002 - Global Trading" },
      { "id": "SUP003", "name": "Staff Suppliers", "label": "SUP003 - Staff Suppliers" }
    ],
    "gl_accounts": [
      { "code": "1400", "name": "Inventory", "label": "1400 - Inventory" },
      { "code": "5100", "name": "COGS", "label": "5100 - COGS" },
      { "code": "4000", "name": "Sales", "label": "4000 - Sales" },
      { "code": "5000", "name": "Purchases", "label": "5000 - Purchases" }
    ],
    "locations": [
      { "id": "LOC001", "name": "Main Warehouse" },
      { "id": "LOC002", "name": "Retail Store" },
      { "id": "LOC003", "name": "New Location" }
    ],
    "companies": [
      { "id": "101", "code": "101", "name": "Alpha" },
      { "id": "102", "code": "102", "name": "Beta" },
      { "id": "103", "code": "103", "name": "Gamma" }
    ]
  }
  ```

---

### 3.2 `GET /inventory/items`
Paginated search and list of item master records with multi-criteria filtering.

- **Query Parameters**:
  - `search`: string (matches code, name, barcode, supplier_code, brand, category)
  - `company_id`: string (e.g. `101`)
  - `main_category`: string (`CAT1`, `CAT2`, `CAT3`)
  - `sub_category`: string
  - `brand`: string
  - `status`: `Active` | `Inactive`
  - `flag`: `all` | `inventory` | `sales` | `purchase` | `production`
  - `page`: integer (default `1`)
  - `page_size`: integer (default `20`)
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "code": "10001",
        "name": "Staff Gram Flour",
        "description": "Premium quality gram flour for food processing",
        "main_category": "CAT1",
        "main_category_name": "CAT1 - Flour",
        "sub_category": "Food Flour",
        "brand": "Staff",
        "base_uom": "KG",
        "companies": ["101", "102"],
        "is_active": true,
        "is_inventory": true,
        "is_sales": true,
        "is_purchase": true,
        "is_production": false,
        "barcode": "955100010001",
        "supplier_code": "STF-FL-01"
      }
    ],
    "total": 24,
    "page": 1,
    "page_size": 20
  }
  ```

---

### 3.3 `GET /inventory/items/{code}`
Retrieves complete Item aggregate for record view and editing.

- **Response `200 OK`**:
  ```json
  {
    "code": "10001",
    "name": "Staff Gram Flour",
    "description": "Premium quality gram flour for food processing",
    "main_category": "CAT1",
    "main_category_name": "CAT1 - Flour",
    "sub_category": "Food Flour",
    "brand": "Staff",
    "uom_group": "Weight",
    "base_uom": "KG",
    "hs_code": "1106.10",
    "weight": 1.0,
    "barcode": "955100010001",
    "supplier_code": "STF-FL-01",
    "is_active": true,
    "picture_url": null,
    "companies": [
      { "company_id": "101", "company_name": "Alpha", "is_allocated": true, "is_active": true },
      { "company_id": "102", "company_name": "Beta", "is_allocated": true, "is_active": true },
      { "company_id": "103", "company_name": "Gamma", "is_allocated": false, "is_active": false }
    ],
    "company_settings": {
      "101": {
        "is_inventory": true,
        "is_sales": true,
        "is_purchase": true,
        "is_production": false,
        "sales_uom": "KG",
        "purchase_uom": "KG",
        "tax_code": "VAT 8%",
        "reorder_level": 100,
        "inventory_account": "1400 - Inventory",
        "cogs_account": "5100 - COGS",
        "sales_account": "4000 - Sales",
        "purchase_account": "5000 - Purchases",
        "sales_description": "Staff Gram Flour 1KG Pack",
        "sales_barcode": "955100010001",
        "allow_discount": true,
        "price_lists": [
          {
            "id": "pl-101-1",
            "price_list": "Retail",
            "sales_uom": "KG",
            "currency": "LKR",
            "unit_price": 5500,
            "min_qty": 1,
            "effective_from": "2026-01-01",
            "effective_to": "",
            "status": "Active"
          }
        ]
      }
    },
    "uom_conversions": [
      {
        "id": "uom-1",
        "base_uom": "KG",
        "base_units": 1,
        "alternate_uom": "BAG",
        "alternate_units": 25,
        "remarks": "25 KG bag",
        "is_active": true
      }
    ],
    "supplier_pricing": [
      {
        "id": "sp-1",
        "supplier_id": "SUP001",
        "supplier_name": "SUP001 - ABC Foods",
        "supplier_item_code": "ABC-10505",
        "purchase_uom": "KG",
        "currency": "LKR",
        "unit_price": 4800,
        "moq": 25,
        "lead_days": 7,
        "effective_from": "2026-01-01",
        "effective_to": "",
        "is_preferred": true,
        "is_active": true
      }
    ],
    "inventory_locations": [
      {
        "location_id": "LOC001",
        "location_name": "Main Warehouse",
        "default_bin": "BIN-A01",
        "min_stock": 100,
        "max_stock": 500,
        "reorder_level": 100,
        "on_hand": 420,
        "committed": 30,
        "ordered": 200,
        "available": 390,
        "status": "Active"
      }
    ]
  }
  ```
- **Error `404 Not Found`**:
  ```json
  {
    "detail": "Item 99999 not found"
  }
  ```

---

### 3.4 `POST /inventory/items`
Creates a new item. The server generates the item code based on category range (`CAT1` -> `10000+`, `CAT2` -> `20000+`, `CAT3` -> `30000+`, other -> `90000+`).

- **Request Body**:
  ```json
  {
    "name": "Staff Organic Gram Flour",
    "description": "Certified organic gram flour",
    "main_category": "CAT1",
    "sub_category": "Food Flour",
    "brand": "Staff",
    "uom_group": "Weight",
    "base_uom": "KG",
    "hs_code": "1106.10",
    "weight": 1.0,
    "barcode": "",
    "supplier_code": "",
    "is_active": true,
    "company_settings": {},
    "uom_conversions": [],
    "supplier_pricing": [],
    "inventory_locations": []
  }
  ```
- **Response `201 Created`**: Returns full Item aggregate including the generated `code` (e.g. `"10010"`).

---

### 3.5 `PUT /inventory/items/{code}`
Updates an existing item. Note: `code` and `base_uom` are strictly immutable once saved.

- **Request Body**: Same schema as `Item` aggregate.
- **Response `200 OK`**: Returns updated `Item` aggregate.

---

### 3.6 `DELETE /inventory/items/{code}`
Deletes an item record.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "deleted_code": "10001"
  }
  ```

---

### 3.7 `POST /inventory/items/{code}/allocations`
Allocates an item to a company. Allocation is one-way (items cannot be deallocated).

- **Request Body**:
  ```json
  {
    "company_id": "103"
  }
  ```
- **Response `200 OK`**: Returns updated `Item` aggregate with company allocated.

---

### 3.8 `PATCH /inventory/items/{code}/allocations/{company_id}`
Updates company-level active status for an allocated company.

- **Request Body**:
  ```json
  {
    "is_active": false
  }
  ```
- **Response `200 OK`**: Returns updated `Item` aggregate.

---

## 4. Item Categories & Number Series Endpoints

All endpoints are mounted under `/inventory/item-categories` (with global prefix `/v1`).

### 4.1 `GET /inventory/item-categories/summary`
Returns count summary for category stats cards.

- **Response `200 OK`**:
  ```json
  {
    "total": 8,
    "main_count": 3,
    "sub_count": 5,
    "items_assigned": 0
  }
  ```

---

### 4.2 `GET /inventory/item-categories`
List item categories with filtering and pagination.

- **Query Parameters**:
  - `search`: string (filters code, name, parent code/name)
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

---

### 4.3 `GET /inventory/item-categories/main-options`
Returns active Main categories for the Parent dropdown in Sub category creation.

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

---

### 4.4 `GET /inventory/item-categories/{category_id}`
Returns category detail including number series and audit information.

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

---

### 4.5 `POST /inventory/item-categories`
Creates a new category and its independent number series.

- **Request Body**:
  ```json
  {
    "category_code": "SNACK",
    "category_name": "Snacks",
    "category_level": "SUB",
    "parent_category_id": 2,
    "description": "Savory snacks",
    "active": true,
    "number_series": {
      "prefix": "SNK",
      "start_number": 1
    }
  }
  ```
- **Response `201 Created`**: Returns `CategoryDetail` schema.

---

### 4.6 `PUT /inventory/item-categories/{category_id}`
Updates an existing category. `category_code` and `category_level` are immutable.

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
      "next_number": 10
    }
  }
  ```
- **Response `200 OK`**: Returns updated `CategoryDetail` schema.

---

### 4.7 `DELETE /inventory/item-categories/{category_id}`
Deletes category and number series if eligible.

- **Response `204 No Content`**
- **Error `409 Conflict`**:
  ```json
  {
    "detail": "Cannot delete this Main Category because it has Sub Categories.",
    "code": "category_has_subcategories"
  }
  ```

