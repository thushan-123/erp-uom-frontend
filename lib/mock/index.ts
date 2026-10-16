import type {
  Item,
  PaginatedResponse,
  ItemListSummary,
  ItemCompanyAllocation,
} from "@/lib/types/item";
import type { MockPersona } from "@/lib/types/navigation";
import { getMockUser, generateMockTokenPair } from "./auth";
import { getMockNavigationTree } from "./navigation";
import { MOCK_USER_COMPANIES } from "./companies";
import { MOCK_LOOKUPS } from "./lookups";
import {
  createInitialSeedItems,
  generateItemCode,
  toItemListSummary,
  generateDefaultCompanySettings,
} from "./items";

// Persist items in globalThis to survive Next.js HMR
interface GlobalMockStore {
  items: Item[];
}

const globalStore = globalThis as unknown as {
  __nexone_mock_store__?: GlobalMockStore;
};

if (!globalStore.__nexone_mock_store__) {
  globalStore.__nexone_mock_store__ = {
    items: createInitialSeedItems(),
  };
}

export function getMockStore(): GlobalMockStore {
  return globalStore.__nexone_mock_store__!;
}

// Reset store to seeds (useful for test/demo)
export function resetMockStore(): void {
  globalStore.__nexone_mock_store__ = {
    items: createInitialSeedItems(),
  };
}

// Artificial latency helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface MockResponse<T = unknown> {
  status: number;
  data: T;
}

export async function handleMockRequest(
  method: string,
  pathname: string,
  query: Record<string, string> = {},
  body: unknown = null,
  persona: MockPersona = "admin"
): Promise<MockResponse> {
  // Add realistic network delay
  await delay(120);

  const cleanPath = pathname.replace(/^\/api\/tenant/, "").replace(/^\/api/, "");
  const normalizedMethod = method.toUpperCase();
  const store = getMockStore();

  // 1. Auth endpoints
  if (cleanPath === "/auth/login" && normalizedMethod === "POST") {
    const creds = body as { username?: string; password?: string } | null;
    if (!creds?.username || !creds?.password) {
      return { status: 400, data: { detail: "Username and password required" } };
    }
    const targetPersona: MockPersona =
      creds.username === "sales"
        ? "sales"
        : creds.username === "inventory"
        ? "inventory"
        : "admin";

    const tokens = generateMockTokenPair(targetPersona);
    return { status: 200, data: tokens };
  }

  if (cleanPath === "/auth/refresh" && normalizedMethod === "POST") {
    const tokens = generateMockTokenPair(persona);
    return { status: 200, data: tokens };
  }

  if (cleanPath === "/auth/logout" && normalizedMethod === "POST") {
    return { status: 200, data: { success: true } };
  }

  if (cleanPath === "/auth/logout-all" && normalizedMethod === "POST") {
    return { status: 200, data: { success: true } };
  }

  if (cleanPath === "/auth/me" && normalizedMethod === "GET") {
    return { status: 200, data: getMockUser(persona) };
  }

  // 2. Navigation & Permissions
  if (cleanPath === "/navigation/tree" && normalizedMethod === "GET") {
    return { status: 200, data: getMockNavigationTree(persona) };
  }

  if (cleanPath === "/companies/mine" && normalizedMethod === "GET") {
    return { status: 200, data: MOCK_USER_COMPANIES };
  }

  if (cleanPath === "/permissions/check" && normalizedMethod === "GET") {
    const companyId = query.company_id;
    const menu = query.menu;
    const activity = query.activity;
    if (!menu || !activity) {
      return { status: 400, data: { detail: "Missing menu or activity parameter" } };
    }
    const hasPermission =
      persona === "admin" ||
      (persona === "inventory" && menu !== "sales-pricing") ||
      (persona === "sales" && menu === "item-details" && activity === "view");
    return {
      status: 200,
      data: {
        granted: hasPermission,
        company_id: companyId,
        menu,
        activity,
      },
    };
  }

  // 3. Lookups
  if (cleanPath === "/inventory/lookups" && normalizedMethod === "GET") {
    return { status: 200, data: MOCK_LOOKUPS };
  }

  // 4. Items CRUD & Allocations
  // 4.1 List items: GET /inventory/items
  if (cleanPath === "/inventory/items" && normalizedMethod === "GET") {
    const search = (query.search || "").toLowerCase().trim();
    const companyId = query.company_id || "";
    const mainCat = query.main_category || "";
    const subCat = query.sub_category || "";
    const brand = query.brand || "";
    const status = query.status || "";
    const flag = (query.flag || "all").toLowerCase();
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const pageSize = Math.max(1, parseInt(query.page_size || "20", 10));

    const filtered = store.items.filter((item) => {
      // Search
      if (search) {
        const targetStr = [
          item.code,
          item.name,
          item.barcode,
          item.supplier_code,
          item.brand,
          item.main_category_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!targetStr.includes(search)) return false;
      }

      // Company filter
      if (companyId) {
        const isAllocated = item.companies.some(
          (c) => c.company_id === companyId && c.is_allocated
        );
        if (!isAllocated) return false;
      }

      // Main category filter
      if (mainCat) {
        if (item.main_category !== mainCat && !item.main_category_name.startsWith(mainCat)) {
          return false;
        }
      }

      // Sub category filter
      if (subCat && item.sub_category !== subCat) {
        return false;
      }

      // Brand filter
      if (brand && item.brand !== brand) {
        return false;
      }

      // Status filter
      if (status === "Active" && !item.is_active) return false;
      if (status === "Inactive" && item.is_active) return false;

      // Stats flag filter: all | inventory | sales | purchase | production
      const settings =
        companyId && item.company_settings[companyId]
          ? item.company_settings[companyId]
          : item.company_settings["101"] || Object.values(item.company_settings)[0] || {
              is_inventory: true,
              is_sales: true,
              is_purchase: true,
              is_production: false,
            };

      if (flag === "inventory" && !settings.is_inventory) return false;
      if (flag === "sales" && !settings.is_sales) return false;
      if (flag === "purchase" && !settings.is_purchase) return false;
      if (flag === "production" && !settings.is_production) return false;

      return true;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paged = filtered.slice(startIndex, startIndex + pageSize);

    const summaries: ItemListSummary[] = paged.map((it) =>
      toItemListSummary(it, companyId)
    );

    const response: PaginatedResponse<ItemListSummary> = {
      items: summaries,
      total,
      page,
      page_size: pageSize,
    };

    return { status: 200, data: response };
  }

  // 4.2 Create item: POST /inventory/items
  if (cleanPath === "/inventory/items" && normalizedMethod === "POST") {
    const payload = body as Partial<Item> | null;
    if (!payload?.name || !payload?.main_category) {
      return {
        status: 400,
        data: { detail: "Item Name and Main Category are required" },
      };
    }

    const catLookup = MOCK_LOOKUPS.main_categories.find(
      (c) => c.code === payload.main_category
    );
    const catName = catLookup ? catLookup.name : payload.main_category;

    const generatedCode = generateItemCode(payload.main_category, store.items);

    // Initial allocations: default to Company 101 allocated and active
    const defaultCompanies: ItemCompanyAllocation[] = [
      { company_id: "101", company_name: "Alpha", is_allocated: true, is_active: true },
      { company_id: "102", company_name: "Beta", is_allocated: false, is_active: false },
      { company_id: "103", company_name: "Gamma", is_allocated: false, is_active: false },
    ];

    const newItem: Item = {
      code: generatedCode,
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      main_category: payload.main_category,
      main_category_name: catName,
      sub_category: payload.sub_category || "",
      brand: payload.brand || "-- None --",
      uom_group: payload.uom_group || "Weight",
      base_uom: payload.base_uom || "KG",
      hs_code: payload.hs_code?.trim() || "",
      weight: payload.weight !== undefined ? payload.weight : null,
      barcode: payload.barcode || "",
      supplier_code: payload.supplier_code || "",
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      picture_url: payload.picture_url || null,
      companies: payload.companies || defaultCompanies,
      company_settings: payload.company_settings || {
        "101": generateDefaultCompanySettings("101"),
        "102": generateDefaultCompanySettings("102"),
        "103": generateDefaultCompanySettings("103"),
      },
      uom_conversions: payload.uom_conversions || [],
      supplier_pricing: payload.supplier_pricing || [],
      inventory_locations: payload.inventory_locations || [
        {
          location_id: "LOC001",
          location_name: "Main Warehouse",
          default_bin: "BIN-A01",
          min_stock: 0,
          max_stock: 0,
          reorder_level: 0,
          on_hand: 0,
          committed: 0,
          ordered: 0,
          available: 0,
          status: "Active",
        },
      ],
    };

    store.items.push(newItem);
    return { status: 201, data: newItem };
  }

  // 4.3 Allocations sub-routes:
  // POST /inventory/items/{code}/allocations
  const allocPostMatch = cleanPath.match(/^\/inventory\/items\/([^/]+)\/allocations$/);
  if (allocPostMatch && normalizedMethod === "POST") {
    const code = allocPostMatch[1];
    const item = store.items.find((x) => x.code === code);
    if (!item) {
      return { status: 404, data: { detail: `Item ${code} not found` } };
    }
    const { company_id } = (body as { company_id: string }) || {};
    if (!company_id) {
      return { status: 400, data: { detail: "company_id is required" } };
    }

    const companyEntry = item.companies.find((c) => c.company_id === company_id);
    if (companyEntry) {
      companyEntry.is_allocated = true;
      companyEntry.is_active = true;
    } else {
      const compName =
        MOCK_LOOKUPS.companies.find((c) => c.id === company_id)?.name || company_id;
      item.companies.push({
        company_id,
        company_name: compName,
        is_allocated: true,
        is_active: true,
      });
    }

    if (!item.company_settings[company_id]) {
      item.company_settings[company_id] = generateDefaultCompanySettings(company_id);
    }

    return { status: 200, data: item };
  }

  // PATCH /inventory/items/{code}/allocations/{company_id}
  const allocPatchMatch = cleanPath.match(
    /^\/inventory\/items\/([^/]+)\/allocations\/([^/]+)$/
  );
  if (allocPatchMatch && normalizedMethod === "PATCH") {
    const code = allocPatchMatch[1];
    const companyId = allocPatchMatch[2];
    const item = store.items.find((x) => x.code === code);
    if (!item) {
      return { status: 404, data: { detail: `Item ${code} not found` } };
    }
    const { is_active } = (body as { is_active: boolean }) || {};
    const companyEntry = item.companies.find((c) => c.company_id === companyId);
    if (!companyEntry || !companyEntry.is_allocated) {
      return {
        status: 400,
        data: { detail: "Cannot toggle active state of non-allocated company" },
      };
    }

    companyEntry.is_active = Boolean(is_active);
    return { status: 200, data: item };
  }

  // 4.4 Single item: GET / PUT / DELETE /inventory/items/{code}
  const itemMatch = cleanPath.match(/^\/inventory\/items\/([^/]+)$/);
  if (itemMatch) {
    const code = itemMatch[1];
    const index = store.items.findIndex((x) => x.code === code);

    if (normalizedMethod === "GET") {
      if (index === -1) {
        return { status: 404, data: { detail: `Item ${code} not found` } };
      }
      return { status: 200, data: store.items[index] };
    }

    if (normalizedMethod === "PUT") {
      if (index === -1) {
        return { status: 404, data: { detail: `Item ${code} not found` } };
      }
      const existing = store.items[index];
      const payload = body as Partial<Item>;

      const catLookup = payload.main_category
        ? MOCK_LOOKUPS.main_categories.find((c) => c.code === payload.main_category)
        : null;

      const updated: Item = {
        ...existing,
        ...payload,
        code: existing.code, // Code is immutable
        base_uom: existing.base_uom, // Base UOM is locked after item creation
        main_category_name: catLookup
          ? catLookup.name
          : payload.main_category_name || existing.main_category_name,
        company_settings: {
          ...existing.company_settings,
          ...(payload.company_settings || {}),
        },
      };

      store.items[index] = updated;
      return { status: 200, data: updated };
    }

    if (normalizedMethod === "DELETE") {
      if (index === -1) {
        return { status: 404, data: { detail: `Item ${code} not found` } };
      }
      store.items.splice(index, 1);
      return { status: 200, data: { success: true, deleted_code: code } };
    }
  }

  // 404 for unknown endpoints
  return {
    status: 404,
    data: { detail: `Endpoint not found: ${normalizedMethod} ${pathname}` },
  };
}
