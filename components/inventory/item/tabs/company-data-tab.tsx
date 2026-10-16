"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { GlAccountLookupDialog } from "../dialogs/gl-account-lookup-dialog";
import type { CompanyItemSettings, ItemLookups } from "@/lib/types/item";

interface CompanyDataTabProps {
  companyId: string;
  companyName: string;
  settings: CompanyItemSettings;
  onChange: (updated: CompanyItemSettings) => void;
  disabled: boolean;
  lookups: ItemLookups;
}

export function CompanyDataTab({
  companyId,
  companyName,
  settings,
  onChange,
  disabled,
  lookups,
}: CompanyDataTabProps) {
  const [glLookupTarget, setGlLookupTarget] = useState<
    | "inventory_account"
    | "cogs_account"
    | "sales_account"
    | "purchase_account"
    | null
  >(null);

  const handleGlSelect = (label: string) => {
    if (!glLookupTarget) return;
    onChange({
      ...settings,
      [glLookupTarget]: label,
    });
  };

  const uomList = lookups.base_uoms.concat(lookups.alternate_uoms.filter(u => !lookups.base_uoms.includes(u)));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Company Item Settings — {companyId} - {companyName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Checkboxes strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-inv"
                checked={settings.is_inventory}
                disabled={disabled}
                onCheckedChange={(c) =>
                  onChange({ ...settings, is_inventory: Boolean(c) })
                }
              />
              <Label
                htmlFor="flag-inv"
                className="text-xs font-medium cursor-pointer"
              >
                Inventory Item
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-sales"
                checked={settings.is_sales}
                disabled={disabled}
                onCheckedChange={(c) =>
                  onChange({ ...settings, is_sales: Boolean(c) })
                }
              />
              <Label
                htmlFor="flag-sales"
                className="text-xs font-medium cursor-pointer"
              >
                Sales Item
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-purchase"
                checked={settings.is_purchase}
                disabled={disabled}
                onCheckedChange={(c) =>
                  onChange({ ...settings, is_purchase: Boolean(c) })
                }
              />
              <Label
                htmlFor="flag-purchase"
                className="text-xs font-medium cursor-pointer"
              >
                Purchase Item
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="flag-prod"
                checked={settings.is_production}
                disabled={disabled}
                onCheckedChange={(c) =>
                  onChange({ ...settings, is_production: Boolean(c) })
                }
              />
              <Label
                htmlFor="flag-prod"
                className="text-xs font-medium cursor-pointer"
              >
                Production Item
              </Label>
            </div>
          </div>

          <Separator />

          {/* Two columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: UOM & Tax */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-28 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Sales UOM
                </Label>
                <NativeSelect
                  value={settings.sales_uom || "KG"}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...settings, sales_uom: e.target.value })
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
                <Label className="w-full sm:w-28 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Purchase UOM
                </Label>
                <NativeSelect
                  value={settings.purchase_uom || "KG"}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...settings, purchase_uom: e.target.value })
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
                <Label className="w-full sm:w-28 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Tax Code
                </Label>
                <NativeSelect
                  value={settings.tax_code || "VAT 8%"}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...settings, tax_code: e.target.value })
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

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-28 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Reorder Level
                </Label>
                <Input
                  type="number"
                  value={settings.reorder_level}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      reorder_level: Number(e.target.value || 0),
                    })
                  }
                  className="h-8 text-xs font-mono flex-1 w-full"
                />
              </div>
            </div>

            {/* Right: G/L Accounts */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Inventory Account
                </Label>
                <div className="flex flex-1 items-center gap-1.5 w-full">
                  <Input
                    value={settings.inventory_account || "1400 - Inventory"}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({ ...settings, inventory_account: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={() => setGlLookupTarget("inventory_account")}
                    className="size-8 shrink-0"
                  >
                    <Search className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  COGS Account
                </Label>
                <div className="flex flex-1 items-center gap-1.5 w-full">
                  <Input
                    value={settings.cogs_account || "5100 - COGS"}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({ ...settings, cogs_account: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={() => setGlLookupTarget("cogs_account")}
                    className="size-8 shrink-0"
                  >
                    <Search className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Revenue / Sales Account
                </Label>
                <div className="flex flex-1 items-center gap-1.5 w-full">
                  <Input
                    value={settings.sales_account || "4000 - Sales"}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({ ...settings, sales_account: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={() => setGlLookupTarget("sales_account")}
                    className="size-8 shrink-0"
                  >
                    <Search className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <Label className="w-full sm:w-36 text-left sm:text-right text-xs text-muted-foreground shrink-0">
                  Purchase / Expense
                </Label>
                <div className="flex flex-1 items-center gap-1.5 w-full">
                  <Input
                    value={settings.purchase_account || "5000 - Purchases"}
                    disabled={disabled}
                    onChange={(e) =>
                      onChange({ ...settings, purchase_account: e.target.value })
                    }
                    className="h-8 text-xs font-mono flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    onClick={() => setGlLookupTarget("purchase_account")}
                    className="size-8 shrink-0"
                  >
                    <Search className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <GlAccountLookupDialog
        open={Boolean(glLookupTarget)}
        onOpenChange={(open) => {
          if (!open) setGlLookupTarget(null);
        }}
        accounts={lookups.gl_accounts}
        title={
          glLookupTarget === "inventory_account"
            ? "Select Inventory Asset Account"
            : glLookupTarget === "cogs_account"
            ? "Select Cost of Goods Sold Account"
            : glLookupTarget === "sales_account"
            ? "Select Revenue / Sales Account"
            : "Select Purchase / Expense Account"
        }
        onSelect={handleGlSelect}
      />
    </div>
  );
}
