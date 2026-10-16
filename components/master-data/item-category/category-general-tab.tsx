"use client";

import React from "react";
import { type UseFormReturn, Controller } from "react-hook-form";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { CategoryFormValues } from "@/lib/schemas/item-category";
import type { MainCategoryOption } from "@/lib/types/item-category";

interface CategoryGeneralTabProps {
  form: UseFormReturn<CategoryFormValues>;
  mode: "view" | "edit" | "new";
  mainOptions: MainCategoryOption[];
  loadingOptions: boolean;
  onLevelChange: (level: "MAIN" | "SUB") => void;
}

export function CategoryGeneralTab({
  form,
  mode,
  mainOptions,
  loadingOptions,
  onLevelChange,
}: CategoryGeneralTabProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const isView = mode === "view";
  const categoryLevel = watch("category_level");

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Category Information Card */}
      <Card className="shadow-none border">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Category Information
          </div>

          {/* Category Code */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="category_code" className="text-xs sm:text-right font-medium text-muted-foreground">
              Category Code <span className="text-destructive">*</span>
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Input
                id="category_code"
                {...register("category_code")}
                disabled={isView}
                maxLength={30}
                placeholder="e.g. BEV"
                className="h-8 text-xs font-mono uppercase bg-background"
                onChange={(e) => {
                  setValue("category_code", e.target.value.toUpperCase(), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
              {errors.category_code && (
                <p className="text-xs text-destructive">
                  {errors.category_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Category Name */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="category_name" className="text-xs sm:text-right font-medium text-muted-foreground">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Input
                id="category_name"
                {...register("category_name")}
                disabled={isView}
                maxLength={100}
                placeholder="e.g. Beverages"
                className="h-8 text-xs bg-background"
              />
              {errors.category_name && (
                <p className="text-xs text-destructive">
                  {errors.category_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Category Level */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
            <Label htmlFor="category_level" className="text-xs sm:text-right font-medium text-muted-foreground">
              Category Level <span className="text-destructive">*</span>
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <NativeSelect
                id="category_level"
                value={categoryLevel}
                disabled={isView}
                onChange={(e) => {
                  const val = e.target.value as "MAIN" | "SUB";
                  setValue("category_level", val, { shouldValidate: true, shouldDirty: true });
                  onLevelChange(val);
                }}
                className="w-full sm:w-64"
              >
                <NativeSelectOption value="MAIN">Main Category</NativeSelectOption>
                <NativeSelectOption value="SUB">Sub Category</NativeSelectOption>
              </NativeSelect>
              {errors.category_level && (
                <p className="text-xs text-destructive">
                  {errors.category_level.message}
                </p>
              )}
            </div>
          </div>

          {/* Parent Main Category (visible only for SUB) */}
          {categoryLevel === "SUB" && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start sm:items-center">
              <Label htmlFor="parent_category_id" className="text-xs sm:text-right font-medium text-muted-foreground">
                Parent Main Category <span className="text-destructive">*</span>
              </Label>
              <div className="sm:col-span-3 space-y-1">
                <Controller
                  name="parent_category_id"
                  control={control}
                  render={({ field }) => (
                    <NativeSelect
                      id="parent_category_id"
                      value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                      disabled={isView || loadingOptions}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        field.onChange(val);
                      }}
                      className="w-full sm:w-64"
                    >
                      <NativeSelectOption value="">
                        {loadingOptions ? "Loading..." : "Select Main Category"}
                      </NativeSelectOption>
                      {mainOptions.map((opt) => (
                        <NativeSelectOption key={opt.category_id} value={String(opt.category_id)}>
                          {opt.category_code} - {opt.category_name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                />
                {errors.parent_category_id && (
                  <p className="text-xs text-destructive">
                    {errors.parent_category_id.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-4 items-start">
            <Label htmlFor="description" className="text-xs sm:text-right font-medium text-muted-foreground pt-1.5">
              Description
            </Label>
            <div className="sm:col-span-3 space-y-1">
              <Textarea
                id="description"
                {...register("description")}
                disabled={isView}
                maxLength={250}
                placeholder="Category description..."
                className="text-xs bg-background min-h-[70px] resize-y"
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="shadow-none border">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Status
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isView}
                />
              )}
            />
            <Label htmlFor="active" className="text-xs font-normal cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Hierarchy Rule Info Box */}
      <Alert className="border bg-muted/30 p-3 sm:p-4 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="size-3.5 text-primary" />
          <span>Hierarchy rule</span>
        </div>
        <AlertDescription className="text-xs text-muted-foreground pl-5 leading-relaxed">
          A Main Category has no parent. A Sub Category must belong to one Main Category. Items should normally be assigned to the lowest category level used by the business.
        </AlertDescription>
      </Alert>
    </div>
  );
}
