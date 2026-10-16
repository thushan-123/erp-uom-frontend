import type { ItemLookups } from "@/lib/types/item";
import { MOCK_COMPANIES } from "./companies";

export const MOCK_LOOKUPS: ItemLookups = {
  main_categories: [
    {
      code: "CAT1",
      name: "CAT1 - Flour",
      sub_categories: ["Food Flour", "Industrial Flour"],
    },
    {
      code: "CAT2",
      name: "CAT2 - Beverages",
      sub_categories: ["Soft Drinks", "Juices"],
    },
    {
      code: "CAT3",
      name: "CAT3 - Packaging",
      sub_categories: ["Boxes", "Bags"],
    },
  ],
  brands: ["Staff", "Coca Cola", "NexOne"],
  uom_groups: ["Weight", "Quantity", "Volume"],
  base_uoms: ["KG", "PCS", "LTR", "BOX", "NOS"],
  alternate_uoms: [
    "PCS",
    "NOS",
    "BOX",
    "BAG",
    "CTN",
    "KG",
    "G",
    "LTR",
    "ML",
    "TON",
  ],
  tax_codes: ["VAT 8%", "VAT 0%", "Exempt"],
  price_lists: ["Retail", "Wholesale", "VIP", "Export"],
  currencies: ["LKR", "USD", "EUR"],
  suppliers: [
    { id: "SUP001", name: "ABC Foods", label: "SUP001 - ABC Foods" },
    { id: "SUP002", name: "Global Trading", label: "SUP002 - Global Trading" },
    { id: "SUP003", name: "Staff Suppliers", label: "SUP003 - Staff Suppliers" },
  ],
  gl_accounts: [
    { code: "1400", name: "Inventory", label: "1400 - Inventory" },
    { code: "5100", name: "COGS", label: "5100 - COGS" },
    { code: "4000", name: "Sales", label: "4000 - Sales" },
    { code: "5000", name: "Purchases", label: "5000 - Purchases" },
  ],
  locations: [
    { id: "LOC001", name: "Main Warehouse" },
    { id: "LOC002", name: "Retail Store" },
    { id: "LOC003", name: "New Location" },
  ],
  companies: MOCK_COMPANIES,
};
