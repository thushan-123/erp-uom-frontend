"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
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
import { SalesPriceDialog } from "../dialogs/sales-price-dialog";
import type {
  CompanyItemSettings,
  CompanyPriceList,
  ItemLookups,
} from "@/lib/types/item";

interface SalesPricingTabProps {
  pricingCompanyId: string;
  onPricingCompanyChange: (id: string) => void;
  settings: CompanyItemSettings;
  onSettingsChange: (updated: CompanyItemSettings) => void;
  disabled: boolean;
  lookups: ItemLookups;
}

export function SalesPricingTab({
  pricingCompanyId,
  onPricingCompanyChange,
  settings,
  onSettingsChange,
  disabled,
  lookups,
}: SalesPricingTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<CompanyPriceList | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const priceLists = settings.price_lists || [];
  const uomList = lookups.base_uoms.concat(
    lookups.alternate_uoms.filter((u) => !lookups.base_uoms.includes(u))
  );

  const handleOpenAdd = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row: CompanyPriceList) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleSavePrice = (saved: CompanyPriceList) => {
    const updated = [...priceLists];
    const index = updated.findIndex((r) => r.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.push(saved);
    }
    onSettingsChange({
      ...settings,
      price_lists: updated,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = priceLists.filter((r) => r.id !== deleteTargetId);
    onSettingsChange({
      ...settings,
      price_lists: updated,
    });
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-4">
      {/* Pricing Company Context Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-md border bg-muted/30 px-3 sm:px-4 py-2.5">
        <Label htmlFor="price-company-select" className="text-xs font-semibold shrink-0">
          Pricing Company:
        </Label>
        <NativeSelect
          id="price-company-select"
          value={pricingCompanyId}
          onChange={(e) => onPricingCompanyChange(e.target.value)}
          size="sm"
          className="w-48"
        >
          {lookups.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </NativeSelect>
        <span className="text-[10px] sm:text-[11px] text-muted-foreground w-full sm:w-auto">
          Sales pricing and price lists are configured company-wise.
        </span>
      </div>

      {/* Card 1: Sales Settings */}
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sales Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sales-item-check"
                  checked={settings.is_sales}
                  disabled={disabled}
                  onCheckedChange={(c) =>
                    onSettingsChange({ ...settings, is_sales: Boolean(c) })
                  }
                />
                <Label
                  htmlFor="sales-item-check"
                  className="text-xs font-medium cursor-pointer"
                >
                  Sales Item (Available for order entry)
                </Label>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Default Sales UOM
                </Label>
                <NativeSelect
                  value={settings.sales_uom || "KG"}
                  disabled={disabled}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, sales_uom: e.target.value })
                  }
                  size="sm"
                  className="flex-1 w-full"
                >
                  {uomList.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Sales Tax Code
                </Label>
                <NativeSelect
                  value={settings.tax_code || "VAT 8%"}
                  disabled={disabled}
                  onChange={(e) =>
                    onSettingsChange({ ...settings, tax_code: e.target.value })
                  }
                  size="sm"
                  className="flex-1 w-full"
                >
                  {lookups.tax_codes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Sales Description
                </Label>
                <Input
                  value={settings.sales_description || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      sales_description: e.target.value,
                    })
                  }
                  placeholder="Invoice line item description"
                  className="h-8 text-xs flex-1 w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Sales Barcode
                </Label>
                <Input
                  value={settings.sales_barcode || ""}
                  disabled={disabled}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      sales_barcode: e.target.value,
                    })
                  }
                  placeholder="e.g. 955100010001"
                  className="h-8 text-xs font-mono flex-1 w-full"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1 sm:pl-38">
                <Checkbox
                  id="allow-discount-check"
                  checked={settings.allow_discount !== false}
                  disabled={disabled}
                  onCheckedChange={(c) =>
                    onSettingsChange({
                      ...settings,
                      allow_discount: Boolean(c),
                    })
                  }
                />
                <Label
                  htmlFor="allow-discount-check"
                  className="text-xs font-medium cursor-pointer"
                >
                  Allow Line / Invoice Discounts
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Company Sales Price Lists */}
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Company Sales Price Lists
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
              + Add Price
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-0">
            <Table className="min-w-[750px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">Price List</TableHead>
                  <TableHead className="text-xs">Sales UOM</TableHead>
                  <TableHead className="text-xs">Currency</TableHead>
                  <TableHead className="text-xs">Unit Price</TableHead>
                  <TableHead className="text-xs">Min Qty</TableHead>
                  <TableHead className="text-xs">Effective From</TableHead>
                  <TableHead className="text-xs">Effective To</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {!disabled && <TableHead className="w-20 text-right text-xs">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceLists.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={disabled ? 8 : 9}
                      className="h-20 text-center text-xs text-muted-foreground"
                    >
                      No sales prices configured for this company. Click + Add Price.
                    </TableCell>
                  </TableRow>
                ) : (
                  priceLists.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {p.price_list}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.sales_uom}</TableCell>
                      <TableCell className="font-mono text-xs">{p.currency}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {p.unit_price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.min_qty}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {p.effective_from || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {p.effective_to || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === "Active" ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      {!disabled && (
                        <TableCell className="text-right p-2">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(p)}
                              className="size-7"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTargetId(p.id)}
                              className="size-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <SalesPriceDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingRow}
        priceLists={lookups.price_lists}
        uoms={uomList}
        currencies={lookups.currencies}
        onSave={handleSavePrice}
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
              Delete Sales Price List Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove this price list tier? This action cannot be undone.
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
