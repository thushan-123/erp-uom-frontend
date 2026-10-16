"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategorySummary } from "@/lib/types/item-category";

interface CategoryStatsStripProps {
  summary: CategorySummary | null;
  loading: boolean;
}

export function CategoryStatsStrip({ summary, loading }: CategoryStatsStripProps) {
  const stats = [
    {
      label: "Total Categories",
      value: summary?.total ?? 0,
    },
    {
      label: "Main Categories",
      value: summary?.main_count ?? 0,
    },
    {
      label: "Sub Categories",
      value: summary?.sub_count ?? 0,
    },
    {
      label: "Items Assigned",
      value: summary?.items_assigned ?? 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-muted/20 border-b">
      {stats.map((stat, idx) => (
        <Card key={idx} className="shadow-none border bg-card">
          <CardContent className="p-3 sm:p-4">
            {loading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {stat.label}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
