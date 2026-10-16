"use client";

import React from "react";
import { Boxes, PackageCheck, ShoppingCart, ShoppingBag, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatFlag = "all" | "inventory" | "sales" | "purchase" | "production";

interface ItemStatsStripProps {
  counts: {
    all: number;
    inventory: number;
    sales: number;
    purchase: number;
    production: number;
  };
  activeFlag: StatFlag;
  onSelectFlag: (flag: StatFlag) => void;
}

export function ItemStatsStrip({
  counts,
  activeFlag,
  onSelectFlag,
}: ItemStatsStripProps) {
  const stats = [
    {
      flag: "all" as StatFlag,
      label: "All Items",
      count: counts.all,
      icon: Boxes,
    },
    {
      flag: "inventory" as StatFlag,
      label: "Inventory",
      count: counts.inventory,
      icon: PackageCheck,
    },
    {
      flag: "sales" as StatFlag,
      label: "Sales",
      count: counts.sales,
      icon: ShoppingCart,
    },
    {
      flag: "purchase" as StatFlag,
      label: "Purchase",
      count: counts.purchase,
      icon: ShoppingBag,
    },
    {
      flag: "production" as StatFlag,
      label: "Production",
      count: counts.production,
      icon: Factory,
    },
  ];

  return (
    <div className="flex overflow-x-auto divide-x border-y bg-card py-1 px-2 sm:px-4 sm:py-2 sm:grid sm:grid-cols-5 sm:gap-0 no-scrollbar">
      {stats.map((s) => {
        const isSelected = activeFlag === s.flag && activeFlag !== "all";
        const Icon = s.icon;

        return (
          <div
            key={s.flag}
            onClick={() => onSelectFlag(activeFlag === s.flag ? "all" : s.flag)}
            className={cn(
              "group flex cursor-pointer items-center justify-between px-3 py-1.5 transition-colors shrink-0 min-w-[120px] sm:min-w-0 sm:first:pl-0 sm:last:pr-0",
              "hover:bg-muted/50 rounded-sm sm:rounded-none",
              isSelected && "bg-accent text-accent-foreground font-semibold"
            )}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
          >
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold leading-tight tracking-tight">
                {s.count}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {s.label}
              </span>
            </div>
            <Icon className="size-4 text-muted-foreground transition-transform group-hover:scale-110" />
          </div>
        );
      })}
    </div>
  );
}
