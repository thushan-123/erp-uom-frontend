"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ItemStatsStrip, type StatFlag } from "./item-stats-strip";
import { ItemListToolbar } from "./item-list-toolbar";
import { ItemTable } from "./item-table";
import { listItems, getItemLookups } from "@/lib/api/items";
import { exportItemsToCsv } from "@/lib/utils/csv";
import { useItemUiStore } from "@/lib/stores/item-ui-store";
import type { ItemListSummary, ItemLookups } from "@/lib/types/item";

export function ItemListScreen() {
  const router = useRouter();

  // Selected item state from store
  const selectedCode = useItemUiStore((state) => state.selectedItemCode);
  const setSelectedCode = useItemUiStore((state) => state.setSelectedItemCode);

  // Filter states
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeFlag, setActiveFlag] = useState<StatFlag>("all");

  // Data states
  const [items, setItems] = useState<ItemListSummary[]>([]);
  const [allUnfilteredItems, setAllUnfilteredItems] = useState<ItemListSummary[]>([]);
  const [lookups, setLookups] = useState<ItemLookups>({
    main_categories: [],
    brands: [],
    uom_groups: [],
    base_uoms: [],
    alternate_uoms: [],
    tax_codes: [],
    price_lists: [],
    currencies: [],
    suppliers: [],
    gl_accounts: [],
    locations: [],
    companies: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch lookups once
  useEffect(() => {
    let mounted = true;
    getItemLookups()
      .then((data) => {
        if (mounted) setLookups(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch all items for stats
  useEffect(() => {
    let mounted = true;
    listItems({ page_size: 200 })
      .then((res) => {
        if (mounted) setAllUnfilteredItems(res.items);
      })
      .catch(() => {
        if (mounted) setAllUnfilteredItems([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch filtered items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listItems({
        search,
        company_id: companyFilter,
        main_category: categoryFilter,
        sub_category: subCategoryFilter,
        brand: brandFilter,
        status: statusFilter,
        flag: activeFlag,
        page_size: 100,
      });
      setItems(res.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    companyFilter,
    categoryFilter,
    subCategoryFilter,
    brandFilter,
    statusFilter,
    activeFlag,
  ]);

  useEffect(() => {
    const timer = setTimeout(fetchItems, 150);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  // Compute counts for stats strip
  // The stats strip counts come from the unfiltered / company-scoped items
  const counts = useMemo(() => {
    const baseItems = companyFilter
      ? allUnfilteredItems.filter((x) => x.companies.includes(companyFilter))
      : allUnfilteredItems;

    return {
      all: baseItems.length,
      inventory: baseItems.filter((x) => x.is_inventory).length,
      sales: baseItems.filter((x) => x.is_sales).length,
      purchase: baseItems.filter((x) => x.is_purchase).length,
      production: baseItems.filter((x) => x.is_production).length,
    };
  }, [allUnfilteredItems, companyFilter]);

  const handleOpenItem = (code: string) => {
    router.push(`/inventory/item-details/${code}`);
  };

  const handleExportCsv = () => {
    exportItemsToCsv(items, `nexone-items-${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background min-w-0">
      {/* 1. Page Header */}
      <div className="flex h-auto min-h-12 shrink-0 items-center justify-between border-b bg-card px-3 sm:px-4 py-2 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-bold text-foreground truncate">
            Item Master Data
          </h1>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-none">
            Common item master with company-specific inventory, accounting and sales settings
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={items.length === 0}
          className="h-8 gap-1.5 text-xs shrink-0"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* 2. Access Note Alert */}
      <Alert className="rounded-none border-x-0 border-t-0 border-b bg-muted/30 py-1.5 px-4 text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <AlertDescription className="text-[11px] font-medium text-foreground">
            Full access • Company and location authorization is enforced by the ERP backend
          </AlertDescription>
        </div>
      </Alert>

      {/* 3. Toolbar */}
      <ItemListToolbar
        search={search}
        onSearchChange={setSearch}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        onSubCategoryFilterChange={setSubCategoryFilter}
        brandFilter={brandFilter}
        onBrandFilterChange={setBrandFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCode={selectedCode}
        onOpenSelected={() => {
          if (selectedCode) handleOpenItem(selectedCode);
        }}
        lookups={lookups}
      />

      {/* 4. Stats Strip */}
      <ItemStatsStrip
        counts={counts}
        activeFlag={activeFlag}
        onSelectFlag={setActiveFlag}
      />

      {/* 5. Data Table */}
      <ItemTable
        data={items}
        loading={loading}
        selectedCode={selectedCode}
        onSelectCode={setSelectedCode}
        onOpenCode={handleOpenItem}
      />

      {/* 6. Status Bar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-t bg-muted/20 px-4 text-[11px] text-muted-foreground">
        <span>{items.length} records</span>
        <span className="font-mono">
          {selectedCode ? (
            <span className="text-foreground font-semibold">
              Selected: {selectedCode}
            </span>
          ) : (
            "No row selected"
          )}
        </span>
      </div>
    </div>
  );
}
