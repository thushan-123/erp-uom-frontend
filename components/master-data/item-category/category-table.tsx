"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CategoryListItem } from "@/lib/types/item-category";

interface CategoryTableProps {
  data: CategoryListItem[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
}

export function CategoryTable({
  data,
  loading,
  error,
  onRetry,
  selectedId,
  onSelect,
  onOpen,
}: CategoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo<ColumnDef<CategoryListItem>[]>(
    () => [
      {
        accessorKey: "category_code",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Category Code
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-primary">
            {row.original.category_code}
          </span>
        ),
      },
      {
        accessorKey: "category_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Category Name
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-xs text-foreground">
            {row.original.category_name}
          </span>
        ),
      },
      {
        accessorKey: "category_level",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Level
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const isMain = row.original.category_level === "MAIN";
          return (
            <Badge variant={isMain ? "default" : "secondary"} className="text-[10px] px-2 py-0.5">
              {isMain ? "Main" : "Sub"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "parent_category_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Parent Category
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.parent_category_name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "prefix",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Item Code Prefix
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.prefix || "—"}
          </span>
        ),
      },
      {
        accessorKey: "next_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Next Number
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.next_number ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "items_count",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Items
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.items_count}
          </span>
        ),
      },
      {
        accessorKey: "active",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8 text-xs font-semibold"
          >
            Status
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.active ? "default" : "destructive"}
            className="text-[10px] px-2 py-0.5"
          >
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedItem = useMemo(
    () => data.find((item) => item.category_id === selectedId),
    [data, selectedId]
  );

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error loading categories</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs">
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-muted/40 sticky top-0 z-10 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-9 px-3 text-xs font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell className="px-3 py-2.5"><Skeleton className="h-4 w-14" /></TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = row.original.category_id === selectedId;
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => onSelect(row.original.category_id)}
                    onDoubleClick={() => onOpen(row.original.category_id)}
                    className="cursor-pointer transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2 text-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">
                  No item categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t bg-card px-4 py-2 text-xs text-muted-foreground shrink-0">
        <span>{data.length} records</span>
        <span>
          {selectedItem
            ? `Selected: ${selectedItem.category_code}`
            : "No row selected"}
        </span>
      </div>
    </div>
  );
}
