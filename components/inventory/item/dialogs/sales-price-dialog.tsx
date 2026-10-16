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
import { NativeSelect } from "@/components/ui/native-select";
import { salesPriceSchema, type SalesPriceFormData } from "@/lib/schemas/item";
import type { CompanyPriceList } from "@/lib/types/item";

interface SalesPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompanyPriceList | null;
  priceLists: string[];
  uoms: string[];
  currencies: string[];
  onSave: (price: CompanyPriceList) => void;
}

export function SalesPriceDialog({
  open,
  onOpenChange,
  initialData,
  priceLists,
  uoms,
  currencies,
  onSave,
}: SalesPriceDialogProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SalesPriceFormData>({
    resolver: zodResolver(salesPriceSchema),
    defaultValues: {
      price_list: "Retail",
      sales_uom: "KG",
      currency: "LKR",
      unit_price: 0,
      min_qty: 1,
      effective_from: "",
      effective_to: "",
      status: "Active",
    },
  });

  const priceList = watch("price_list");
  const salesUom = watch("sales_uom");
  const currency = watch("currency");
  const status = watch("status");

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          price_list: initialData.price_list,
          sales_uom: initialData.sales_uom,
          currency: initialData.currency,
          unit_price: initialData.unit_price,
          min_qty: initialData.min_qty,
          effective_from: initialData.effective_from || "",
          effective_to: initialData.effective_to || "",
          status: initialData.status,
        });
      } else {
        reset({
          price_list: priceLists[0] || "Retail",
          sales_uom: uoms[0] || "KG",
          currency: currencies[0] || "LKR",
          unit_price: 0,
          min_qty: 1,
          effective_from: new Date().toISOString().split("T")[0],
          effective_to: "",
          status: "Active",
        });
      }
    }
  }, [open, initialData, priceLists, uoms, currencies, reset]);

  const onSubmit = (data: SalesPriceFormData) => {
    onSave({
      id: initialData?.id || `pl-${Date.now()}`,
      price_list: data.price_list,
      sales_uom: data.sales_uom,
      currency: data.currency,
      unit_price: data.unit_price,
      min_qty: data.min_qty,
      effective_from: data.effective_from || "",
      effective_to: data.effective_to || "",
      status: data.status,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEditing ? "Edit Sales Price" : "Add Sales Price"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure price list tier, currency, unit price, and minimum quantity threshold.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-list" className="text-xs">
                Price List *
              </Label>
              <NativeSelect
                id="sp-list"
                value={priceList}
                onChange={(e) => setValue("price_list", e.target.value)}
                size="sm"
                className="w-full"
              >
                {priceLists.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-uom" className="text-xs">
                Sales UOM *
              </Label>
              <NativeSelect
                id="sp-uom"
                value={salesUom}
                onChange={(e) => setValue("sales_uom", e.target.value)}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <Label htmlFor="sp-unit-price" className="text-xs">
                Unit Price *
              </Label>
              <Input
                id="sp-unit-price"
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
              <Label htmlFor="sp-min-qty" className="text-xs">
                Min Quantity
              </Label>
              <Input
                id="sp-min-qty"
                type="number"
                min="0"
                placeholder="1"
                className="h-8 text-xs font-mono"
                {...register("min_qty", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-status" className="text-xs">
                Status
              </Label>
              <NativeSelect
                id="sp-status"
                value={status}
                onChange={(e) =>
                  setValue("status", e.target.value as "Active" | "Inactive")
                }
                size="sm"
                className="w-full"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </NativeSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sp-ef-from" className="text-xs">
                Effective From
              </Label>
              <Input
                id="sp-ef-from"
                type="date"
                className="h-8 text-xs"
                {...register("effective_from")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sp-ef-to" className="text-xs">
                Effective To
              </Label>
              <Input
                id="sp-ef-to"
                type="date"
                className="h-8 text-xs"
                {...register("effective_to")}
              />
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
              Save Sales Price
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
