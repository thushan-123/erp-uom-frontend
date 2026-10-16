"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect } from "@/components/ui/native-select";
import {
  supplierPricingSchema,
  type SupplierPricingFormData,
} from "@/lib/schemas/item";
import type { SupplierPricing, SupplierLookup } from "@/lib/types/item";

interface SupplierPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SupplierPricing | null;
  suppliers: SupplierLookup[];
  uoms: string[];
  currencies: string[];
  onSave: (pricing: SupplierPricing) => void;
}

export function SupplierPricingDialog({
  open,
  onOpenChange,
  initialData,
  suppliers,
  uoms,
  currencies,
  onSave,
}: SupplierPricingDialogProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SupplierPricingFormData>({
    resolver: zodResolver(supplierPricingSchema),
    defaultValues: {
      supplier_id: "",
      supplier_name: "",
      supplier_item_code: "",
      purchase_uom: "KG",
      currency: "LKR",
      unit_price: 0,
      moq: 0,
      lead_days: 0,
      effective_from: "",
      effective_to: "",
      is_preferred: false,
      is_active: true,
    },
  });

  const supplierId = watch("supplier_id");
  const purchaseUom = watch("purchase_uom");
  const currency = watch("currency");
  const isPreferred = watch("is_preferred");
  const isActive = watch("is_active");

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          supplier_id: initialData.supplier_id,
          supplier_name: initialData.supplier_name,
          supplier_item_code: initialData.supplier_item_code,
          purchase_uom: initialData.purchase_uom,
          currency: initialData.currency,
          unit_price: initialData.unit_price,
          moq: initialData.moq,
          lead_days: initialData.lead_days,
          effective_from: initialData.effective_from || "",
          effective_to: initialData.effective_to || "",
          is_preferred: initialData.is_preferred,
          is_active: initialData.is_active,
        });
      } else {
        reset({
          supplier_id: suppliers[0]?.id || "",
          supplier_name: suppliers[0]?.name || "",
          supplier_item_code: "",
          purchase_uom: uoms[0] || "KG",
          currency: "LKR",
          unit_price: 0,
          moq: 1,
          lead_days: 7,
          effective_from: new Date().toISOString().split("T")[0],
          effective_to: "",
          is_preferred: false,
          is_active: true,
        });
      }
    }
  }, [open, initialData, suppliers, uoms, reset]);

  const onSubmit = (data: SupplierPricingFormData) => {
    const selectedSupplier = suppliers.find((s) => s.id === data.supplier_id);
    const supplierName = selectedSupplier
      ? selectedSupplier.label
      : data.supplier_id;

    onSave({
      id: initialData?.id || `sp-${Date.now()}`,
      supplier_id: data.supplier_id,
      supplier_name: supplierName,
      supplier_item_code: data.supplier_item_code || "",
      purchase_uom: data.purchase_uom,
      currency: data.currency,
      unit_price: data.unit_price,
      moq: data.moq,
      lead_days: data.lead_days,
      effective_from: data.effective_from || "",
      effective_to: data.effective_to || "",
      is_preferred: data.is_preferred,
      is_active: data.is_active,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEditing ? "Edit Supplier Pricing" : "Add Supplier Pricing"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure supplier-specific item code, negotiated purchase price, and lead time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-supplier" className="text-xs">
                Supplier *
              </Label>
              <NativeSelect
                id="sp-supplier"
                value={supplierId}
                onChange={(e) => {
                  setValue("supplier_id", e.target.value);
                  const found = suppliers.find((s) => s.id === e.target.value);
                  if (found) setValue("supplier_name", found.label);
                }}
                size="sm"
                className="w-full"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </NativeSelect>
              {errors.supplier_id && (
                <p className="text-[11px] text-destructive">
                  {errors.supplier_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-item-code" className="text-xs">
                Supplier Item Code
              </Label>
              <Input
                id="sp-item-code"
                placeholder="e.g. ABC-10505"
                className="h-8 text-xs font-mono"
                {...register("supplier_item_code")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-uom" className="text-xs">
                Purchase UOM *
              </Label>
              <NativeSelect
                id="sp-uom"
                value={purchaseUom}
                onChange={(e) => setValue("purchase_uom", e.target.value)}
                size="sm"
                className="w-full"
              >
                {uoms.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-cur" className="text-xs">
                Currency *
              </Label>
              <NativeSelect
                id="sp-cur"
                value={currency}
                onChange={(e) => setValue("currency", e.target.value)}
                size="sm"
                className="w-full"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-price" className="text-xs">
                Unit Price *
              </Label>
              <Input
                id="sp-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="h-8 text-xs font-mono"
                {...register("unit_price", { valueAsNumber: true })}
              />
              {errors.unit_price && (
                <p className="text-[11px] text-destructive">
                  {errors.unit_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-moq" className="text-xs">
                Minimum Order Qty (MOQ)
              </Label>
              <Input
                id="sp-moq"
                type="number"
                min="0"
                placeholder="0"
                className="h-8 text-xs font-mono"
                {...register("moq", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-lead" className="text-xs">
                Lead Time (Days)
              </Label>
              <Input
                id="sp-lead"
                type="number"
                min="0"
                placeholder="7"
                className="h-8 text-xs font-mono"
                {...register("lead_days", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-from" className="text-xs">
                Effective From
              </Label>
              <Input
                id="sp-from"
                type="date"
                className="h-8 text-xs"
                {...register("effective_from")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-to" className="text-xs">
                Effective To
              </Label>
              <Input
                id="sp-to"
                type="date"
                className="h-8 text-xs"
                {...register("effective_to")}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sp-pref"
                checked={isPreferred}
                onCheckedChange={(checked) =>
                  setValue("is_preferred", Boolean(checked))
                }
              />
              <Label
                htmlFor="sp-pref"
                className="text-xs font-medium cursor-pointer"
              >
                Preferred Supplier for this item
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sp-active"
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue("is_active", Boolean(checked))
                }
              />
              <Label
                htmlFor="sp-active"
                className="text-xs font-medium cursor-pointer"
              >
                Active
              </Label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs">
              Save Supplier Pricing
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
