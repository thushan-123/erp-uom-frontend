import type { ItemListSummary } from "@/lib/types/item";

export function exportItemsToCsv(
  items: ItemListSummary[],
  filename: string = "items-master-data.csv"
): void {
  if (!items || items.length === 0) return;

  const headers = [
    "Item Code",
    "Item Name",
    "Main Category",
    "Sub Category",
    "Brand",
    "Base UOM",
    "Companies",
    "Status",
    "Barcode",
    "Supplier Code",
  ];

  const escapeCsv = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const rows = items.map((it) => [
    escapeCsv(it.code),
    escapeCsv(it.name),
    escapeCsv(it.main_category_name || it.main_category),
    escapeCsv(it.sub_category || "—"),
    escapeCsv(it.brand || "—"),
    escapeCsv(it.base_uom),
    escapeCsv(it.companies.join(", ")),
    escapeCsv(it.is_active ? "Active" : "Inactive"),
    escapeCsv(it.barcode || "—"),
    escapeCsv(it.supplier_code || "—"),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
