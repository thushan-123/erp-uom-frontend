"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { searchItems } from "@/lib/api/items";
import { useItemUiStore } from "@/lib/stores/item-ui-store";
import type { ItemListSummary } from "@/lib/types/item";

export function ItemSearchDialog() {
  const router = useRouter();
  const searchDialogOpen = useItemUiStore((state) => state.searchDialogOpen);
  const setSearchDialogOpen = useItemUiStore((state) => state.setSearchDialogOpen);

  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [results, setResults] = useState<ItemListSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchDialogOpen) return;

    let active = true;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const items = await searchItems(query, companyFilter);
        if (active) setResults(items);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchDialogOpen, query, companyFilter]);

  const handleOpenItem = (code: string) => {
    setSearchDialogOpen(false);
    router.push(`/inventory/item-details/${code}`);
  };

  return (
    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
      <DialogContent className="w-[95vw] sm:max-w-4xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 border-b">
          <DialogTitle className="text-base font-bold text-foreground">
            Item Search
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Quickly locate an item by code, name, barcode, supplier code, category, or brand.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b bg-muted/20">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, name, barcode, supplier code..."
              className="pl-8 h-8 text-xs"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Company:</span>
            <NativeSelect
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              size="sm"
            >
              <option value="">All Companies</option>
              <option value="101">101 - Alpha</option>
              <option value="102">102 - Beta</option>
              <option value="103">103 - Gamma</option>
            </NativeSelect>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto max-h-[60vh] min-w-0">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin" />
              Searching items...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No matching items found.
            </div>
          ) : (
            <Table className="min-w-[700px]">
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-mono text-xs">Item Code</TableHead>
                  <TableHead className="text-xs">Item Name</TableHead>
                  <TableHead className="text-xs">Barcode</TableHead>
                  <TableHead className="text-xs">Supplier Code</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Brand</TableHead>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="w-16 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item) => (
                  <TableRow
                    key={item.code}
                    className="cursor-pointer hover:bg-muted/40"
                    onDoubleClick={() => handleOpenItem(item.code)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {item.code}
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {item.name}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.barcode || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {item.supplier_code || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.main_category_name || item.main_category}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.brand || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-wrap gap-1">
                        {item.companies.map((c) => (
                          <Badge
                            key={c}
                            variant="secondary"
                            className="px-1 text-[10px]"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleOpenItem(item.code)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
