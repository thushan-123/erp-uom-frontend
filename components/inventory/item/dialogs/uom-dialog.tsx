"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  uomConversionSchema,
  type UomConversionFormData,
} from "@/lib/schemas/item";
import type { UomConversion } from "@/lib/types/item";

interface UomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseUom: string;
  initialData?: UomConversion | null;
  existingConversions: UomConversion[];
  onSave: (conversion: UomConversion) => void;
}

const ALTERNATE_UOM_OPTIONS = [
  "PCS",
  "NOS",
  "BOX",
  "BAG",
  "CTN",
  "KG",
  "G",
  "LTR",
  "ML",
  "TON",
];

export function UomDialog({
  open,
  onOpenChange,
  baseUom,
  initialData,
  existingConversions,
  onSave,
}: UomDialogProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UomConversionFormData>({
    resolver: zodResolver(uomConversionSchema),
    defaultValues: {
      alternate_uom: "",
      alternate_units: 1,
      remarks: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");
  const alternateUom = watch("alternate_uom");

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          alternate_uom: initialData.alternate_uom,
          alternate_units: initialData.alternate_units,
          remarks: initialData.remarks || "",
          is_active: initialData.is_active,
        });
      } else {
        reset({
          alternate_uom: "",
          alternate_units: 1,
          remarks: "",
          is_active: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: UomConversionFormData) => {
    // 1. Validation: Alternate UOM cannot be identical to Base UOM
    if (data.alternate_uom === baseUom) {
      toast.error("Alternate UOM cannot be the same as the Base UOM");
      return;
    }

    // 2. Validation: Alternate UOM must be unique within item
    const isDuplicate = existingConversions.some(
      (c) =>
        c.alternate_uom === data.alternate_uom &&
        (!initialData || c.id !== initialData.id)
    );
    if (isDuplicate) {
      toast.error(`Alternate UOM "${data.alternate_uom}" already exists for this item`);
      return;
    }

    onSave({
      id: initialData?.id || `uom-${Date.now()}`,
      base_uom: baseUom,
      base_units: 1,
      alternate_uom: data.alternate_uom,
      alternate_units: data.alternate_units,
      remarks: data.remarks || "",
      is_active: data.is_active,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEditing ? "Edit Equivalent UOM" : "Add Equivalent UOM"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Define conversion ratio to fixed stock unit ({baseUom}).
          </DialogDescription>
        </DialogHeader>

        {/* Rule Banner */}
        <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">
            Base UOM: <span className="font-mono text-primary font-bold">{baseUom}</span>
          </div>
          <p className="mt-0.5 text-[11px]">
            Rule: 1 Alternate UOM = Units of Base UOM. Example: 1 BAG = 25 KG.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="uom-alt" className="text-xs">
                Alternate UOM *
              </Label>
              <NativeSelect
                id="uom-alt"
                value={alternateUom}
                onChange={(e) => setValue("alternate_uom", e.target.value)}
                size="sm"
                className="w-full"
              >
                <option value="">-- Select UOM --</option>
                {ALTERNATE_UOM_OPTIONS.map((u) => (
                  <option key={u} value={u} disabled={u === baseUom}>
                    {u} {u === baseUom ? "(Base)" : ""}
                  </option>
                ))}
              </NativeSelect>
              {errors.alternate_uom && (
                <p className="text-[11px] text-destructive">
                  {errors.alternate_uom.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uom-units" className="text-xs">
                Units of Base UOM *
              </Label>
              <Input
                id="uom-units"
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="e.g. 25"
                className="h-8 text-xs font-mono"
                {...register("alternate_units", { valueAsNumber: true })}
              />
              {errors.alternate_units && (
                <p className="text-[11px] text-destructive">
                  {errors.alternate_units.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="uom-remarks" className="text-xs">
              Remarks
            </Label>
            <Input
              id="uom-remarks"
              placeholder="e.g. 25 KG standard packaging bag"
              className="h-8 text-xs"
              {...register("remarks")}
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="uom-active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", Boolean(checked))}
            />
            <Label
              htmlFor="uom-active"
              className="text-xs font-medium cursor-pointer"
            >
              Active for transactions
            </Label>
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
