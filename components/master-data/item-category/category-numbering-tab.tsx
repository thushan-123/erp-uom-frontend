"use client";

import React, { useEffect } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CategoryFormValues } from "@/lib/schemas/item-category";

interface CategoryNumberingTabProps {
  form: UseFormReturn<CategoryFormValues>;
  mode: "view" | "edit" | "new";
  hasAllocated?: boolean;
  minNextNumber?: number;
}

export function CategoryNumberingTab({
  form,
  mode,
  hasAllocated = false,
  minNextNumber = 1,
}: CategoryNumberingTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const isView = mode === "view";
  const isNew = mode === "new";
  const isEdit = mode === "edit";

  const startNumber = watch("start_number");

  // In new mode, next_number mirrors start_number
  useEffect(() => {
    if (isNew) {
      setValue("next_number", startNumber || 1, {
        shouldValidate: true,
      });
    }
  }, [isNew, startNumber, setValue]);

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Item Code Numbering Card */}
      <Card className="shadow-none border">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Item Code Numbering
          </div>

          {/* Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="prefix" className="text-xs sm:text-right font-medium text-muted-foreground">
              Item Code Prefix
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Input
                id="prefix"
                {...register("prefix")}
                disabled={isView || (isEdit && hasAllocated)}
                maxLength={10}
                placeholder="e.g. BEV"
                className="h-8 text-xs font-mono uppercase bg-background max-w-xs"
                onChange={(e) => {
                  setValue("prefix", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              {isEdit && hasAllocated && (
                <p className="text-[11px] text-muted-foreground">
                  Prefix cannot be changed because numbers have already been allocated from this series.
                </p>
              )}
              {errors.prefix && (
                <p className="text-xs text-destructive">
                  {errors.prefix.message}
                </p>
              )}
            </div>
          </div>

          {/* Starting Number */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="start_number" className="text-xs sm:text-right font-medium text-muted-foreground">
              Starting Number
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Input
                id="start_number"
                type="number"
                min={1}
                {...register("start_number", { valueAsNumber: true })}
                disabled={isView || (isEdit && hasAllocated)}
                className="h-8 text-xs font-mono bg-background max-w-xs"
              />
              {isEdit && hasAllocated && (
                <p className="text-[11px] text-muted-foreground">
                  Starting number cannot be changed because numbers have already been allocated.
                </p>
              )}
              {errors.start_number && (
                <p className="text-xs text-destructive">
                  {errors.start_number.message}
                </p>
              )}
            </div>
          </div>

          {/* Next Number */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="next_number" className="text-xs sm:text-right font-medium text-muted-foreground">
              Next Number
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Input
                id="next_number"
                type="number"
                min={isEdit ? minNextNumber : 1}
                {...register("next_number", { valueAsNumber: true })}
                disabled={isView || isNew}
                className="h-8 text-xs font-mono bg-background max-w-xs"
              />
              {isNew && (
                <p className="text-[11px] text-muted-foreground">
                  Next number mirrors starting number for new categories and is allocated upon saving items.
                </p>
              )}
              {isEdit && (
                <p className="text-[11px] text-muted-foreground">
                  Next number can only be increased (current minimum: {minNextNumber}).
                </p>
              )}
              {errors.next_number && (
                <p className="text-xs text-destructive">
                  {errors.next_number.message}
                </p>
              )}
            </div>
          </div>

          {/* Important note */}
          <Alert className="border bg-muted/30 p-3 text-xs text-muted-foreground">
            <AlertDescription className="text-xs leading-relaxed">
              <strong className="text-foreground">Important:</strong> The category can define the item-code prefix and number sequence, but the actual item code is generated by the backend during Item creation. Example: <strong className="text-foreground font-mono">BEV000001</strong>. Selecting a category alone must not consume a number.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Example Box */}
      <Card className="shadow-none border">
        <CardContent className="p-4 sm:p-5 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Example
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Main Category: Beverages → Prefix: <span className="font-mono font-medium text-foreground">BEV</span><br />
            Sub Category: Soft Drinks → Prefix: <span className="font-mono font-medium text-foreground">SFT</span><br />
            <br />
            The final numbering strategy should be decided centrally by NexOne number-series rules before production.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
