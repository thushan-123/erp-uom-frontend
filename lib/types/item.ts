export interface UomConversion {
  id: string;
  base_uom: string;
  base_units: number;
  alternate_uom: string;
  alternate_units: number;
  remarks: string;
  is_active: boolean;
}

export interface SupplierPricing {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_item_code: string;
  purchase_uom: string;
  currency: string;
  unit_price: number;
  moq: number;
  lead_days: number;
  effective_from: string;
  effective_to: string;
  is_preferred: boolean;
  is_active: boolean;
}

export interface CompanyPriceList {
  id: string;
  price_list: string;
  sales_uom: string;
  currency: string;
  unit_price: number;
  min_qty: number;
  effective_from: string;
  effective_to: string;
  status: "Active" | "Inactive";
}

export interface InventoryLocation {
  location_id: string;
  location_name: string;
  default_bin: string;
  min_stock: number;
  max_stock: number;
  reorder_level: number;
  on_hand: number;
  committed: number;
  ordered: number;
  available: number;
  status: "Active" | "Inactive";
}

export interface ItemCompanyAllocation {
  company_id: string;
  company_name: string;
  is_allocated: boolean;
  is_active: boolean;
}

export interface CompanyItemSettings {
  is_inventory: boolean;
  is_sales: boolean;
  is_purchase: boolean;
  is_production: boolean;
  sales_uom: string;
  purchase_uom: string;
  tax_code: string;
  reorder_level: number;
  inventory_account: string;
  cogs_account: string;
  sales_account: string;
  purchase_account: string;
  sales_description?: string;
  sales_barcode?: string;
  allow_discount?: boolean;
  price_lists?: CompanyPriceList[];
}

export interface Item {
  code: string;
  name: string;
  description: string;
  main_category: string;
  main_category_name: string;
  sub_category: string;
  brand: string;
  uom_group: string;
  base_uom: string;
  hs_code: string;
  weight: number | null;
  barcode: string;
  supplier_code: string;
  is_active: boolean;
  picture_url: string | null;
  companies: ItemCompanyAllocation[];
  company_settings: Record<string, CompanyItemSettings>;
  uom_conversions: UomConversion[];
  supplier_pricing: SupplierPricing[];
  inventory_locations: InventoryLocation[];
}

export interface ItemListSummary {
  code: string;
  name: string;
  description: string;
  main_category: string;
  main_category_name: string;
  sub_category: string;
  brand: string;
  base_uom: string;
  companies: string[];
  is_active: boolean;
  is_inventory: boolean;
  is_sales: boolean;
  is_purchase: boolean;
  is_production: boolean;
  barcode: string;
  supplier_code: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface CategoryLookup {
  code: string;
  name: string;
  sub_categories: string[];
}

export interface SupplierLookup {
  id: string;
  name: string;
  label: string;
}

export interface GlAccountLookup {
  code: string;
  name: string;
  label: string;
}

export interface LocationLookup {
  id: string;
  name: string;
}

export interface CompanyLookup {
  id: string;
  code: string;
  name: string;
}

export interface ItemLookups {
  main_categories: CategoryLookup[];
  brands: string[];
  uom_groups: string[];
  base_uoms: string[];
  alternate_uoms: string[];
  tax_codes: string[];
  price_lists: string[];
  currencies: string[];
  suppliers: SupplierLookup[];
  gl_accounts: GlAccountLookup[];
  locations: LocationLookup[];
  companies: CompanyLookup[];
}
