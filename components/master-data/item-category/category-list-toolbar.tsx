"use client";

import React from "react";
import { Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface CategoryListToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  levelFilter: string;
  onLevelFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  hasSelection: boolean;
  onOpenSelected: () => void;
}

export function CategoryListToolbar({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
  statusFilter,
  onStatusFilterChange,
  hasSelection,
  onOpenSelected,
}: CategoryListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 p-3 sm:px-4 bg-card border-b">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search category code or name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 pr-2.5 text-xs bg-background"
        />
      </div>

      {/* Level Filter */}
      <div className="w-auto">
        <NativeSelect
          value={levelFilter}
          onChange={(e) => onLevelFilterChange(e.target.value)}
          className="w-[140px]"
        >
          <NativeSelectOption value="">All Levels</NativeSelectOption>
          <NativeSelectOption value="MAIN">Main Categories</NativeSelectOption>
          <NativeSelectOption value="SUB">Sub Categories</NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Status Filter */}
      <div className="w-auto">
        <NativeSelect
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="w-[120px]"
        >
          <NativeSelectOption value="">All Status</NativeSelectOption>
          <NativeSelectOption value="active">Active</NativeSelectOption>
          <NativeSelectOption value="inactive">Inactive</NativeSelectOption>
        </NativeSelect>
      </div>

      <div className="flex-1" />

      {/* Open Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={!hasSelection}
        onClick={onOpenSelected}
        className="h-8 text-xs gap-1.5"
      >
        <FolderOpen className="size-3.5" />
        <span>Open</span>
      </Button>
    </div>
  );
}
