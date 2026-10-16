import { z } from "zod";

export const itemHeaderSchema = z.object({
  name: z.string().min(1, "Item Name is required"),
  description: z.string(),
  main_category: z.string().min(1, "Main Category is required"),
  sub_category: z.string(),
  brand: z.string(),
  uom_group: z.string(),
  base_uom: z.string().min(1, "Base UOM is required"),
  hs_code: z.string(),
  weight: z.number().min(0, "Weight must be non-negative").nullable(),
});

export type ItemHeaderFormData = z.infer<typeof itemHeaderSchema>;

export const uomConversionSchema = z.object({
  alternate_uom: z.string().min(1, "Alternate UOM is required"),
  alternate_units: z
    .number()
    .positive("Units of Base UOM must be greater than zero")
    .finite("Units must be a finite number"),
  remarks: z.string(),
  is_active: z.boolean(),
});

export type UomConversionFormData = z.infer<typeof uomConversionSchema>;

export const supplierPricingSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  supplier_name: z.string(),
  supplier_item_code: z.string(),
  purchase_uom: z.string().min(1, "Purchase UOM is required"),
  currency: z.string().min(1, "Currency is required"),
  unit_price: z
    .number()
    .positive("Unit Price must be greater than zero"),
  moq: z.number().min(0, "MOQ must be 0 or greater"),
  lead_days: z.number().min(0, "Lead Days must be 0 or greater"),
  effective_from: z.string(),
  effective_to: z.string(),
  is_preferred: z.boolean(),
  is_active: z.boolean(),
});

export type SupplierPricingFormData = z.infer<typeof supplierPricingSchema>;

export const salesPriceSchema = z.object({
  price_list: z.string().min(1, "Price List is required"),
  sales_uom: z.string().min(1, "Sales UOM is required"),
  currency: z.string().min(1, "Currency is required"),
  unit_price: z
    .number()
    .positive("Unit Price must be greater than zero"),
  min_qty: z.number().min(0, "Min Qty must be 0 or greater"),
  effective_from: z.string(),
  effective_to: z.string(),
  status: z.enum(["Active", "Inactive"]),
});

export type SalesPriceFormData = z.infer<typeof salesPriceSchema>;

export const inventoryLocationSchema = z.object({
  location_id: z.string().min(1, "Location is required"),
  location_name: z.string(),
  default_bin: z.string(),
  min_stock: z.number().min(0),
  max_stock: z.number().min(0),
  reorder_level: z.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});

export type InventoryLocationFormData = z.infer<typeof inventoryLocationSchema>;
