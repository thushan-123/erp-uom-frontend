import type {
  NavigationTreeResponse,
  MockPersona,
  ActivityCode,
} from "@/lib/types/navigation";

export function getMockNavigationTree(
  persona: MockPersona = "admin"
): NavigationTreeResponse {
  const allActivities: ActivityCode[] = ["view", "create", "edit", "delete"];
  const viewOnly: ActivityCode[] = ["view"];

  // Persona based logic
  const isSales = persona === "sales";
  const isInventory = persona === "inventory";

  return {
    modules: [
      {
        app_label: "master_data",
        title: "Master Data",
        is_locked: isSales,
        lock_reason: isSales ? "Locked for Sales persona" : undefined,
        groups: [
          {
            title: "Common Master Data",
            items: [
              {
                code: "business-partner",
                title: "Business Partner Master Data",
                uri: "/master-data/business-partner",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: No view permission" : undefined,
                activities: isSales ? [] : allActivities,
              },
            ],
          },
          {
            title: "Inventory Master Data",
            items: [
              {
                code: "locations",
                title: "Location Details",
                uri: "/master-data/locations",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: No view permission" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "item-categories",
                title: "Item Categories (Main/Sub)",
                uri: "/master-data/item-categories",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: No view permission" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "uom",
                title: "Units of Measure",
                uri: "/master-data/uom",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: No view permission" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "inventory-gl-mapping",
                title: "Inventory G/L Account Mapping",
                uri: "/master-data/inventory-gl-mapping",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: No view permission" : undefined,
                activities: isSales ? [] : allActivities,
              },
            ],
          },
        ],
      },
      {
        app_label: "inventory",
        title: "Inventory",
        is_locked: false,
        items: [
          {
            code: "item-details",
            title: "Item Details",
            uri: "/inventory/item-details",
            is_locked: false,
            activities: isSales ? viewOnly : allActivities,
          },
        ],
        groups: [
          {
            title: "Pricing",
            items: [
              {
                code: "sales-pricing",
                title: "Sales Pricing",
                uri: "/inventory/sales-pricing",
                is_locked: isInventory,
                lock_reason: isInventory
                  ? "Locked: Permission required"
                  : undefined,
                activities: isInventory ? [] : allActivities,
              },
              {
                code: "purchase-pricing",
                title: "Purchase Pricing",
                uri: "/inventory/purchase-pricing",
                is_locked: isSales,
                lock_reason: isSales ? "Locked: Inventory module required" : undefined,
                activities: isSales ? [] : allActivities,
              },
            ],
          },
          {
            title: "Inventory Transactions",
            items: [
              {
                code: "purchase-order",
                title: "Purchase Order",
                uri: "/inventory/purchase-order",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "grn",
                title: "Good Receipt (GRN)",
                uri: "/inventory/grn",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "stock-issue",
                title: "Stock Issue",
                uri: "/inventory/stock-issue",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "stock-transfer",
                title: "Stock Transfer",
                uri: "/inventory/stock-transfer",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "stock-adjustments",
                title: "Stock Adjustments",
                uri: "/inventory/stock-adjustments",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "production-receipts",
                title: "Production Receipts",
                uri: "/inventory/production-receipts",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
            ],
          },
          {
            title: "Reports",
            items: [
              {
                code: "grn-summary",
                title: "GRN Summary",
                uri: "/inventory/reports/grn-summary",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "stock-balance",
                title: "Stock Balance",
                uri: "/inventory/reports/stock-balance",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
              {
                code: "stock-movement",
                title: "Stock Movement Analysis",
                uri: "/inventory/reports/stock-movement",
                is_locked: isSales,
                lock_reason: isSales ? "Locked for Sales persona" : undefined,
                activities: isSales ? [] : allActivities,
              },
            ],
          },
        ],
      },
    ],
  };
}
