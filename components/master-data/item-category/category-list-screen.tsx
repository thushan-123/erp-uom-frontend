"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermission } from "@/components/providers/navigation-provider";
import { CategoryStatsStrip } from "./category-stats-strip";
import { CategoryListToolbar } from "./category-list-toolbar";
import { CategoryTable } from "./category-table";
import { listCategories, getCategorySummary } from "@/lib/api/item-categories";
import type { CategoryListItem, CategorySummary } from "@/lib/types/item-category";

export function CategoryListScreen() {
  const router = useRouter();
  const canCreate = usePermission("item_categories", "create");

  // Selection state
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"MAIN" | "SUB" | "">("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">("");

  // Data states
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await getCategorySummary();
      setSummary(data);
    } catch {
      // Keep existing summary or null
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listCategories({
        search: debouncedSearch,
        level: levelFilter,
        status: statusFilter,
        page_size: 200,
      });
      setCategories(res.items);
    } catch (err) {
      setError((err as Error).message || "Failed to load item categories.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, levelFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchSummary, 0);
    return () => clearTimeout(timer);
  }, [fetchSummary]);

  useEffect(() => {
    const timer = setTimeout(fetchCategories, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const handleOpenSelected = (id?: number) => {
    const targetId = id ?? selectedId;
    if (targetId) {
      router.push(`/master-data/item-categories/${targetId}`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-card shrink-0">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-foreground">
            Item Categories
          </h1>
          <p className="text-xs text-muted-foreground">
            Main Categories and Sub Categories
          </p>
        </div>

        <div>
          {canCreate ? (
            <Button
              size="sm"
              onClick={() => router.push("/master-data/item-categories/new")}
              className="h-8 gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              <span>New Category</span>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <span>
                  <Button
                    size="sm"
                    disabled
                    className="h-8 gap-1.5 text-xs opacity-50 cursor-not-allowed"
                  >
                    <Plus className="size-3.5" />
                    <span>New Category</span>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>You don&apos;t have permission</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <Alert className="rounded-none border-x-0 border-t-0 border-b bg-muted/40 py-2 px-4 flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
        <AlertDescription className="text-xs">
          Categories organize items hierarchically. Main Categories can contain multiple Sub Categories.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <CategoryStatsStrip summary={summary} loading={summaryLoading} />

      {/* Toolbar */}
      <CategoryListToolbar
        search={search}
        onSearchChange={setSearch}
        levelFilter={levelFilter}
        onLevelFilterChange={(val) => setLevelFilter(val as "MAIN" | "SUB" | "")}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => setStatusFilter(val as "active" | "inactive" | "")}
        hasSelection={selectedId !== null}
        onOpenSelected={() => handleOpenSelected()}
      />

      {/* Table */}
      <CategoryTable
        data={categories}
        loading={loading}
        error={error}
        onRetry={fetchCategories}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        onOpen={(id) => handleOpenSelected(id)}
      />
    </div>
  );
}
