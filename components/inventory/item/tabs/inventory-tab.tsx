"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import type { InventoryLocation, ItemLookups } from "@/lib/types/item";

interface InventoryTabProps {
  locations: InventoryLocation[];
  onChange: (locations: InventoryLocation[]) => void;
  disabled: boolean;
  lookups: ItemLookups;
}

export function InventoryTab({
  locations,
  onChange,
  disabled,
  lookups,
}: InventoryTabProps) {
  const handleAddLocation = () => {
    const nextLoc = lookups.locations.find(
      (l) => !locations.some((curr) => curr.location_id === l.id)
    ) || lookups.locations[0] || { id: "LOC-NEW", name: "New Location" };

    const newRow: InventoryLocation = {
      location_id: nextLoc.id,
      location_name: nextLoc.name,
      default_bin: "BIN-01",
      min_stock: 0,
      max_stock: 0,
      reorder_level: 0,
      on_hand: 0,
      committed: 0,
      ordered: 0,
      available: 0,
      status: "Active",
    };
    onChange([...locations, newRow]);
  };

  const handleUpdateRow = (
    index: number,
    field: keyof InventoryLocation,
    val: unknown
  ) => {
    const updated = [...locations];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Inventory by Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-0">
            <Table className="min-w-[850px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs w-44">Location</TableHead>
                  <TableHead className="text-xs w-32">Default Bin</TableHead>
                  <TableHead className="text-xs w-24">Min Stock</TableHead>
                  <TableHead className="text-xs w-24">Max Stock</TableHead>
                  <TableHead className="text-xs w-24">Reorder Level</TableHead>
                  <TableHead className="text-xs w-24 bg-muted/30">On Hand</TableHead>
                  <TableHead className="text-xs w-24 bg-muted/30">Committed</TableHead>
                  <TableHead className="text-xs w-24 bg-muted/30">Ordered</TableHead>
                  <TableHead className="text-xs w-24 bg-muted/30">Available</TableHead>
                  <TableHead className="text-xs w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-20 text-center text-xs text-muted-foreground"
                    >
                      No locations defined. Click + Add Location to allocate stock tracking.
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc, idx) => (
                    <TableRow key={idx}>
                      {/* Location Selector */}
                      <TableCell className="p-2">
                        {disabled ? (
                          <span className="text-xs font-medium">
                            {loc.location_name}
                          </span>
                        ) : (
                          <NativeSelect
                            value={loc.location_id}
                            onChange={(e) => {
                              const found = lookups.locations.find(
                                (l) => l.id === e.target.value
                              );
                              handleUpdateRow(idx, "location_id", e.target.value);
                              if (found) {
                                handleUpdateRow(idx, "location_name", found.name);
                              }
                            }}
                            size="sm"
                            className="w-full"
                          >
                            {lookups.locations.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </NativeSelect>
                        )}
                      </TableCell>

                      {/* Default Bin */}
                      <TableCell className="p-2">
                        <Input
                          value={loc.default_bin}
                          disabled={disabled}
                          onChange={(e) =>
                            handleUpdateRow(idx, "default_bin", e.target.value)
                          }
                          className="h-7 text-xs font-mono"
                          placeholder="BIN-A01"
                        />
                      </TableCell>

                      {/* Min Stock */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={loc.min_stock}
                          disabled={disabled}
                          onChange={(e) =>
                            handleUpdateRow(
                              idx,
                              "min_stock",
                              Number(e.target.value || 0)
                            )
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </TableCell>

                      {/* Max Stock */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={loc.max_stock}
                          disabled={disabled}
                          onChange={(e) =>
                            handleUpdateRow(
                              idx,
                              "max_stock",
                              Number(e.target.value || 0)
                            )
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </TableCell>

                      {/* Reorder Level */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={loc.reorder_level}
                          disabled={disabled}
                          onChange={(e) =>
                            handleUpdateRow(
                              idx,
                              "reorder_level",
                              Number(e.target.value || 0)
                            )
                          }
                          className="h-7 text-xs font-mono"
                        />
                      </TableCell>

                      {/* Read-only stock numbers */}
                      <TableCell className="p-2 bg-muted/20 font-mono text-xs font-semibold text-center">
                        {loc.on_hand}
                      </TableCell>
                      <TableCell className="p-2 bg-muted/20 font-mono text-xs font-medium text-center text-muted-foreground">
                        {loc.committed}
                      </TableCell>
                      <TableCell className="p-2 bg-muted/20 font-mono text-xs font-medium text-center text-muted-foreground">
                        {loc.ordered}
                      </TableCell>
                      <TableCell className="p-2 bg-muted/20 font-mono text-xs font-bold text-center text-primary">
                        {loc.available}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="p-2">
                        <Badge
                          variant={loc.status === "Active" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {loc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t p-3">
            <p className="text-[11px] text-muted-foreground">
              On Hand, Committed, Ordered and Available are read-only values sourced from inventory transactions / stock ledger.
            </p>
            {!disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLocation}
                className="h-7 gap-1 text-xs"
              >
                <Plus className="size-3.5" />
                + Add Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
