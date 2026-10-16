"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronsUpDown,
  Check,
  Search,
  X,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "cn";
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
import { SupplierPricingDialog } from "../dialogs/supplier-pricing-dialog";
import type {
  SupplierPricing,
  ItemLookups,
} from "@/lib/types/item";

interface PurchasingTabProps {
  supplierPricing: SupplierPricing[];
  onPricingChange: (pricing: SupplierPricing[]) => void;
  defaultPurchaseUom: string;
  onDefaultPurchaseUomChange: (val: string) => void;
  defaultTaxCode: string;
  onDefaultTaxCodeChange: (val: string) => void;
  preferredSupplierId: string;
  onPreferredSupplierChange: (val: string) => void;
  disabled: boolean;
  lookups: ItemLookups;
}

export function PurchasingTab({
  supplierPricing,
  onPricingChange,
  defaultPurchaseUom,
  onDefaultPurchaseUomChange,
  defaultTaxCode,
  onDefaultTaxCodeChange,
  preferredSupplierId,
  onPreferredSupplierChange,
  disabled,
  lookups,
}: PurchasingTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<SupplierPricing | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);

  const selectedSupplier = lookups.suppliers.find(
    (s) => s.id === preferredSupplierId
  );

  const handlePreferredSupplierSelect = (supplierId: string) => {
    onPreferredSupplierChange(supplierId);

    // If this supplier exists in supplierPricing, sync the preferred flag
    if (supplierPricing.length > 0) {
      const updated = supplierPricing.map((r) => ({
        ...r,
        is_preferred: r.supplier_id === supplierId,
      }));
      onPricingChange(updated);
    }
  };

  const uomList = lookups.base_uoms.concat(
    lookups.alternate_uoms.filter((u) => !lookups.base_uoms.includes(u))
  );

  const handleOpenAdd = () => {
    setEditingRow(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (row: SupplierPricing) => {
    setEditingRow(row);
    setModalOpen(true);
  };

  const handleSaveRow = (saved: SupplierPricing) => {
    let updated = [...supplierPricing];

    // Single preferred supplier rule: if saved is preferred, clear preferred on others
    if (saved.is_preferred) {
      updated = updated.map((r) => ({
        ...r,
        is_preferred: r.id === saved.id ? true : false,
      }));
      onPreferredSupplierChange(saved.supplier_id);
    }

    const index = updated.findIndex((r) => r.id === saved.id);
    if (index >= 0) {
      updated[index] = saved;
    } else {
      updated.push(saved);
    }

    onPricingChange(updated);
  };

  const handleTogglePreferred = (id: string) => {
    if (disabled) return;
    const updated = supplierPricing.map((r) => ({
      ...r,
      is_preferred: r.id === id,
    }));
    const target = updated.find((r) => r.id === id);
    if (target) {
      onPreferredSupplierChange(target.supplier_id);
    }
    onPricingChange(updated);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = supplierPricing.filter((r) => r.id !== deleteTargetId);
    onPricingChange(updated);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top 2 Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Card 1: Common Purchasing Defaults */}
        <Card>
          <CardHeader className="py-2.5 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Common Purchasing Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                Default Purchase UOM
              </Label>
              <NativeSelect
                value={defaultPurchaseUom || "KG"}
                disabled={disabled}
                onChange={(e) => onDefaultPurchaseUomChange(e.target.value)}
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
                Default Tax Code
              </Label>
              <NativeSelect
                value={defaultTaxCode || "VAT 8%"}
                disabled={disabled}
                onChange={(e) => onDefaultTaxCodeChange(e.target.value)}
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

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                Preferred Supplier
              </Label>
              <div className="flex-1 w-full">
                <Popover open={supplierSearchOpen} onOpenChange={setSupplierSearchOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={supplierSearchOpen}
                        disabled={disabled}
                        size="sm"
                        className={cn(
                          "w-full justify-between text-xs font-normal h-8 px-2.5 bg-background hover:bg-accent/40",
                          !selectedSupplier && "text-muted-foreground"
                        )}
                      >
                        <span className="truncate">
                          {selectedSupplier ? selectedSupplier.label : "-- Search or select preferred supplier --"}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 opacity-60 ml-2">
                          <Search className="size-3" />
                          <ChevronsUpDown className="size-3" />
                        </div>
                      </Button>
                    }
                  />
                  <PopoverContent className="w-[calc(100vw-3rem)] sm:w-[360px] max-w-[360px] p-0 shadow-md" align="start">
                    <Command className="rounded-lg">
                      <CommandInput
                        placeholder="Search supplier code or name..."
                        className="text-xs h-9"
                      />
                      <CommandList className="max-h-60 p-1">
                        <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
                          No matching supplier found.
                        </CommandEmpty>
                        <CommandGroup heading="Suppliers">
                          <CommandItem
                            value="none clear empty -- none --"
                            onSelect={() => {
                              handlePreferredSupplierSelect("");
                              setSupplierSearchOpen(false);
                            }}
                            className="text-xs cursor-pointer italic text-muted-foreground flex items-center justify-between py-1.5 px-2"
                          >
                            <div className="flex items-center gap-2">
                              <X className="size-3 text-muted-foreground" />
                              <span>-- None / Clear Selection --</span>
                            </div>
                            {!preferredSupplierId && (
                              <Check className="size-3.5 text-primary" />
                            )}
                          </CommandItem>
                          {lookups.suppliers.map((s) => {
                            const isSelected = preferredSupplierId === s.id;
                            return (
                              <CommandItem
                                key={s.id}
                                value={`${s.id} ${s.name} ${s.label}`}
                                onSelect={() => {
                                  handlePreferredSupplierSelect(s.id);
                                  setSupplierSearchOpen(false);
                                }}
                                className="text-xs cursor-pointer flex items-center justify-between py-1.5 px-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Check
                                    className={cn(
                                      "size-3.5 shrink-0 text-primary",
                                      isSelected ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="font-medium truncate">{s.label}</span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="font-mono text-[10px] shrink-0 ml-2"
                                >
                                  {s.id}
                                </Badge>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Purchasing Rule */}
        <Card>
          <CardHeader className="py-2.5 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Purchasing Rule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
            <p>
              Supplier relationship, supplier item code, pricing, MOQ, lead time,
              and preferred supplier designation are common item-level purchasing data.
            </p>
            <p className="text-[11px] leading-relaxed">
              • Only one supplier can be marked as preferred per item. Setting a new
              preferred supplier automatically clears other preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Item Pricing Table */}
      <Card>
        <CardHeader className="py-2.5 px-3 sm:px-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Supplier Item Pricing
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
              + Add Supplier Pricing
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-w-0">
            <Table className="min-w-[850px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-16 text-center text-xs">Preferred</TableHead>
                  <TableHead className="text-xs">Supplier</TableHead>
                  <TableHead className="text-xs">Supplier Item Code</TableHead>
                  <TableHead className="text-xs">UOM</TableHead>
                  <TableHead className="text-xs">Currency</TableHead>
                  <TableHead className="text-xs">Unit Price</TableHead>
                  <TableHead className="text-xs">MOQ</TableHead>
                  <TableHead className="text-xs">Lead Days</TableHead>
                  <TableHead className="text-xs">From</TableHead>
                  <TableHead className="text-xs">To</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {!disabled && <TableHead className="w-20 text-right text-xs">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierPricing.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={disabled ? 11 : 12}
                      className="h-20 text-center text-xs text-muted-foreground"
                    >
                      No supplier pricing configured. Click + Add Supplier Pricing.
                    </TableCell>
                  </TableRow>
                ) : (
                  supplierPricing.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-center p-2">
                        <input
                          type="radio"
                          name="preferred_supplier_radio"
                          checked={Boolean(r.is_preferred)}
                          disabled={disabled}
                          onChange={() => handleTogglePreferred(r.id)}
                          className="size-3.5 accent-primary cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {r.supplier_name || r.supplier_id}
                        {r.is_preferred && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-primary font-bold">
                            <CheckCircle2 className="size-3" />
                            (Pref)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.supplier_item_code || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.purchase_uom}</TableCell>
                      <TableCell className="font-mono text-xs">{r.currency}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold">
                        {r.unit_price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.moq || 0}</TableCell>
                      <TableCell className="font-mono text-xs">{r.lead_days || 0}</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {r.effective_from || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {r.effective_to || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={r.is_active ? "default" : "destructive"}
                          className="text-[10px]"
                        >
                          {r.is_active ? "Active" : "Inactive"}
                        </Badge>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog */}
      <SupplierPricingDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingRow}
        suppliers={lookups.suppliers}
        uoms={uomList}
        currencies={lookups.currencies}
        onSave={handleSaveRow}
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
              Delete Supplier Pricing Record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove this supplier pricing quotation? This action cannot be undone.
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
