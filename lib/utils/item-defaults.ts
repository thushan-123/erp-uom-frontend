import type { CompanyItemSettings } from "@/lib/types/item";

export function createDefaultCompanySettings(
  companyId: string,
  overrides?: Partial<CompanyItemSettings>
): CompanyItemSettings {
  return {
    is_inventory: true,
    is_sales: true,
    is_purchase: true,
    is_production: false,
    sales_uom: "KG",
    purchase_uom: "KG",
    tax_code: "VAT 8%",
    reorder_level: 100,
    inventory_account: "1400 - Inventory",
    cogs_account: "5100 - COGS",
    sales_account: "4000 - Sales",
    purchase_account: "5000 - Purchases",
    sales_description: "",
    sales_barcode: "",
    allow_discount: true,
    price_lists: [
      {
        id: `pl-${companyId}-1`,
        price_list: "Retail",
        sales_uom: "KG",
        currency: companyId === "102" ? "USD" : companyId === "103" ? "EUR" : "LKR",
        unit_price: 5500,
        min_qty: 1,
        effective_from: "2026-01-01",
        effective_to: "",
        status: "Active",
      },
      {
        id: `pl-${companyId}-2`,
        price_list: "Wholesale",
        sales_uom: "KG",
        currency: companyId === "102" ? "USD" : companyId === "103" ? "EUR" : "LKR",
        unit_price: 5200,
        min_qty: 25,
        effective_from: "2026-01-01",
        effective_to: "",
        status: "Active",
      },
      {
        id: `pl-${companyId}-3`,
        price_list: "VIP",
        sales_uom: "KG",
        currency: companyId === "102" ? "USD" : companyId === "103" ? "EUR" : "LKR",
        unit_price: 5000,
        min_qty: 50,
        effective_from: "2026-01-01",
        effective_to: "",
        status: "Active",
      },
    ],
    ...overrides,
  };
}
