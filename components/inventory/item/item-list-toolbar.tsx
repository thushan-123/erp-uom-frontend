"use client";

import React from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermission } from "@/components/providers/navigation-provider";
import type { ItemLookups } from "@/lib/types/item";

interface ItemListToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
  subCategoryFilter: string;
  onSubCategoryFilterChange: (val: string) => void;
  brandFilter: string;
  onBrandFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  selectedCode: string | null;
  onOpenSelected: () => void;
  lookups: ItemLookups;
}

export function ItemListToolbar({
  search,
  onSearchChange,
  companyFilter,
  onCompanyFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  subCategoryFilter,
  onSubCategoryFilterChange,
  brandFilter,
  onBrandFilterChange,
  statusFilter,
  onStatusFilterChange,
  selectedCode,
  onOpenSelected,
  lookups,
}: ItemListToolbarProps) {
  const canCreate = usePermission("item-details", "create");

  // Determine sub categories depending on chosen category
  const selectedCatObj = lookups.main_categories.find(
    (c) => c.code === categoryFilter
  );
  const availableSubCats = selectedCatObj
    ? selectedCatObj.sub_categories
    : Array.from(
      new Set(lookups.main_categories.flatMap((c) => c.sub_categories))
    );

  return (
    <div className="flex flex-col gap-2.5 border-b bg-background px-3 sm:px-4 py-2.5">
      {/* Row 1: Search & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search code, name, barcode, supplier code..."
            className="pl-8 h-8 text-xs w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedCode}
            onClick={onOpenSelected}
            className="h-8 gap-1.5 text-xs"
          >
            <ExternalLink className="size-3.5" />
            <span>Open</span>
          </Button>

          {canCreate ? (
            <Link href="/inventory/item-details/new">
              <Button size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="size-3.5" />
                <span>New Item</span>
              </Button>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="sm" disabled className="h-8 gap-1.5 text-xs opacity-60">
                    <Plus className="size-3.5" />
                    <span>New Item</span>
                  </Button>
                }
              />
              <TooltipContent>
                You don&apos;t have permission to create items
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Row 2: Filters (2-column grid on mobile, flex on desktop) */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {/* Filter: Company */}
        <NativeSelect
          value={companyFilter}
          onChange={(e) => onCompanyFilterChange(e.target.value)}
          size="sm"
          className="w-full sm:w-32"
        >
          <option value="">Company *</option>
          {lookups.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </NativeSelect>

        {/* Filter: Main Category */}
        <NativeSelect
          value={categoryFilter}
          onChange={(e) => {
            onCategoryFilterChange(e.target.value);
            onSubCategoryFilterChange("");
          }}
          size="sm"
          className="w-full sm:w-36"
        >
          <option value="">Main Category</option>
          {lookups.main_categories.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </NativeSelect>

        {/* Filter: Sub Category */}
        <NativeSelect
          value={subCategoryFilter}
          onChange={(e) => onSubCategoryFilterChange(e.target.value)}
          size="sm"
          className="w-full sm:w-32"
        >
          <option value="">Sub Category</option>
          {availableSubCats.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </NativeSelect>

        {/* Filter: Brand */}
        <NativeSelect
          value={brandFilter}
          onChange={(e) => onBrandFilterChange(e.target.value)}
          size="sm"
          className="w-full sm:w-28"
        >
          <option value="">Brand</option>
          {lookups.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </NativeSelect>

        {/* Filter: Status */}
        <NativeSelect
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          size="sm"
          className="w-full sm:w-28 col-span-2 sm:col-span-1"
        >
          <option value="">Status (All)</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </NativeSelect>
      </div>
    </div>
  );
}
