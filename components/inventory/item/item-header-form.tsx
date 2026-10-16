"use client";

import React, { useRef } from "react";
import { Image as ImageIcon, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import type { ItemLookups } from "@/lib/types/item";

interface ItemHeaderFormProps {
  mode: "view" | "edit" | "new";
  itemCode: string;
  name: string;
  onNameChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  mainCategory: string;
  onMainCategoryChange: (val: string) => void;
  subCategory: string;
  onSubCategoryChange: (val: string) => void;
  brand: string;
  onBrandChange: (val: string) => void;
  uomGroup: string;
  onUomGroupChange: (val: string) => void;
  baseUom: string;
  onBaseUomChange: (val: string) => void;
  hsCode: string;
  onHsCodeChange: (val: string) => void;
  weight: number | null;
  onWeightChange: (val: number | null) => void;
  pictureUrl: string | null;
  onPictureChange: (url: string | null) => void;
  companyContext: string;
  onCompanyContextChange: (companyId: string) => void;
  lookups: ItemLookups;
  errors?: Record<string, string>;
}

export function ItemHeaderForm({
  mode,
  itemCode,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  mainCategory,
  onMainCategoryChange,
  subCategory,
  onSubCategoryChange,
  brand,
  onBrandChange,
  uomGroup,
  onUomGroupChange,
  baseUom,
  onBaseUomChange,
  hsCode,
  onHsCodeChange,
  weight,
  onWeightChange,
  pictureUrl,
  onPictureChange,
  companyContext,
  onCompanyContextChange,
  lookups,
  errors = {},
}: ItemHeaderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isView = mode === "view";
  const isNew = mode === "new";

  // Base UOM is locked once an item exists (edit or view mode)
  const isBaseUomDisabled = isView || !isNew;

  // Sub-categories depend on chosen main category
  const selectedCatObj = lookups.main_categories.find(
    (c) => c.code === mainCategory
  );
  const availableSubCats = selectedCatObj ? selectedCatObj.sub_categories : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onPictureChange(previewUrl);
    }
  };

  return (
    <div className="border-b bg-card">
      {/* Title & Code Bar */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b bg-muted/10">
        <h2 className="text-sm font-bold text-foreground">
          {isNew ? "New Item" : "Edit Item"}
        </h2>
        <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
          {itemCode || "<NEW>"}
        </Badge>
      </div>

      {/* Main Fields Grid */}
      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-12">
        {/* Picture Box (Col: 2 of 12) */}
        <div className="flex flex-col items-center gap-2 lg:col-span-2">
          <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
            {pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pictureUrl}
                alt="Item preview"
                className="size-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-center text-muted-foreground">
                <ImageIcon className="size-6 stroke-1" />
                <span className="text-[10px]">No picture</span>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isView}
            onClick={() => fileInputRef.current?.click()}
            className="h-6 w-24 text-[10px] gap-1"
          >
            <Camera className="size-3" />
            Change
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* Column 1 (Col: 5 of 12) */}
        <div className="space-y-2.5 lg:col-span-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              Item Name *
            </Label>
            <div className="flex-1">
              <Input
                value={name}
                disabled={isView}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter item name"
                className="h-8 text-xs font-semibold w-full"
              />
              {errors.name && (
                <p className="mt-0.5 text-[11px] text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              Description
            </Label>
            <Input
              value={description}
              disabled={isView}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Item details / technical description"
              className="h-8 text-xs flex-1 w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              Main Category *
            </Label>
            <div className="flex-1">
              <NativeSelect
                value={mainCategory}
                disabled={isView}
                onChange={(e) => {
                  onMainCategoryChange(e.target.value);
                  onSubCategoryChange("");
                }}
                size="sm"
                className="w-full"
              >
                <option value="">-- Select Category --</option>
                {lookups.main_categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
              {errors.main_category && (
                <p className="mt-0.5 text-[11px] text-destructive">
                  {errors.main_category}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              Sub Category
            </Label>
            <NativeSelect
              value={subCategory}
              disabled={isView || availableSubCats.length === 0}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              size="sm"
              className="flex-1 w-full"
            >
              <option value="">-- None / Not Applicable --</option>
              {availableSubCats.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Column 2 (Col: 5 of 12) */}
        <div className="space-y-2.5 lg:col-span-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              Brand
            </Label>
            <NativeSelect
              value={brand || "-- None --"}
              disabled={isView}
              onChange={(e) => onBrandChange(e.target.value)}
              size="sm"
              className="flex-1 w-full"
            >
              <option value="-- None --">-- None --</option>
              {lookups.brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
              UOM Group
            </Label>
            <NativeSelect
              value={uomGroup || "Weight"}
              disabled={isView}
              onChange={(e) => onUomGroupChange(e.target.value)}
              size="sm"
              className="flex-1 w-full"
            >
              {lookups.uom_groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                Base UOM *
              </Label>
              <NativeSelect
                value={baseUom || "KG"}
                disabled={isBaseUomDisabled}
                onChange={(e) => onBaseUomChange(e.target.value)}
                size="sm"
                className="flex-1 w-full"
              >
                {lookups.base_uoms.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <p className="sm:ml-26 mt-1 text-[10px] text-muted-foreground">
              {isNew
                ? "Base UOM is the fixed stock unit for this item."
                : "Base UOM is locked after item creation because inventory transactions may depend on it."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Label className="w-full sm:w-24 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                HS Code
              </Label>
              <Input
                value={hsCode}
                disabled={isView}
                onChange={(e) => onHsCodeChange(e.target.value)}
                placeholder="e.g. 1106.10"
                className="h-8 text-xs font-mono w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <Label className="w-full sm:w-16 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                Weight
              </Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                value={weight !== null && weight !== undefined ? weight : ""}
                disabled={isView}
                onChange={(e) =>
                  onWeightChange(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="0.000"
                className="h-8 text-xs font-mono w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Information Section Bar & Company Context */}
      <div className="border-t bg-muted/40 px-3 sm:px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
        Companies Information
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b bg-muted/15 px-3 sm:px-4 py-2 text-xs">
        <Label htmlFor="ctx-company-select" className="font-semibold text-foreground shrink-0">
          Company Context:
        </Label>
        <NativeSelect
          id="ctx-company-select"
          value={companyContext}
          onChange={(e) => onCompanyContextChange(e.target.value)}
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
          Company-specific settings and accounts are shown below.
        </span>
      </div>
    </div>
  );
}
