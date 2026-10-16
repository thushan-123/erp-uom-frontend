"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UomDialog } from "../dialogs/uom-dialog";
import type { UomConversion } from "@/lib/types/item";

interface UomTabProps {
  itemCode: string;
  itemName: string;
  baseUom: string;
  conversions: UomConversion[];
  onChange: (conversions: UomConversion[]) => void;
  disabled: boolean;
}

export function UomTab({
  itemCode,
  itemName,
  baseUom,
  conversions,
  onChange,
  disabled,
}: UomTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<UomConversion | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    if (!baseUom || baseUom === "—" || baseUom === "") {
      toast.error("Please select a Base UOM first.");
      return;
    }
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row: UomConversion) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleSaveConversion = (saved: UomConversion) => {
    const updated = [...conversions];
    const index = updated.findIndex((r) => r.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.push(saved);
    }
    onChange(updated);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = conversions.filter((r) => r.id !== deleteTargetId);
    onChange(updated);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Item Unit of Measurement Conversions
          </CardTitle>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenAdd}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="size-3.5" />
              + Add Equivalent UOM
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Summary line */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 rounded-md border bg-muted/30 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground">Item Code:</span>
              <span className="font-mono font-bold text-foreground">
                {itemCode || "<NEW>"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground">Item Name:</span>
              <span className="font-medium text-foreground">
                {itemName || "—"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-muted-foreground">Base UOM:</span>
              <Badge variant="secondary" className="font-mono text-xs font-bold">
                {baseUom || "—"}
              </Badge>
            </div>
          </div>

          {/* Rule Note */}
          <div className="rounded-md border bg-muted/20 p-2.5 text-xs text-muted-foreground">
            <b>Conversion rule:</b> 1 Alternate UOM = Units of Base UOM. The Base UOM is fixed for the item. Example: 1 BAG = 25 KG.
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-w-0 rounded-md border">
            <Table className="min-w-[650px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">Base UOM</TableHead>
                  <TableHead className="text-xs text-center">Base Units (X)</TableHead>
                  <TableHead className="text-xs">Alternate UOM</TableHead>
                  <TableHead className="text-xs text-right">Alternate Units (Y)</TableHead>
                  <TableHead className="text-xs font-semibold">Equivalent</TableHead>
                  <TableHead className="text-xs">Active</TableHead>
                  <TableHead className="text-xs">Remarks</TableHead>
                  {!disabled && <TableHead className="w-20 text-right text-xs">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={disabled ? 7 : 8}
                      className="h-24 text-center text-xs text-muted-foreground"
                    >
                      No equivalent UOMs defined. Click <b>+ Add Equivalent UOM</b>.
                    </TableCell>
                  </TableRow>
                ) : (
                  conversions.map((r) => {
                    const formattedUnits = Number(r.alternate_units).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 6 }
                    );
                    const equivalentStr = `1 ${r.alternate_uom} = ${formattedUnits} ${baseUom}`;

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {baseUom}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-center text-muted-foreground">
                          1
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold">
                          {r.alternate_uom}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-right">
                          {r.alternate_units}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          {equivalentStr}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={r.is_active ? "default" : "destructive"}
                            className="text-[10px]"
                          >
                            {r.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.remarks || "—"}
                        </TableCell>
                        {!disabled && (
                          <TableCell className="text-right p-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(r)}
                                className="size-7"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTargetId(r.id)}
                                className="size-7 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <UomDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        baseUom={baseUom}
        initialData={editingRow}
        existingConversions={conversions}
        onSave={handleSaveConversion}
      />

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">
              Delete UOM Conversion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete this equivalent unit conversion? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
