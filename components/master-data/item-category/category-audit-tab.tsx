"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { AuditDetail } from "@/lib/types/item-category";

interface CategoryAuditTabProps {
  audit?: AuditDetail | null;
  isNew?: boolean;
}

function formatAuditDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch {
    return "—";
  }
}

export function CategoryAuditTab({ audit, isNew = false }: CategoryAuditTabProps) {
  if (isNew || !audit) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
        <Card className="shadow-none border bg-muted/20">
          <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
            <div>
              <span className="font-bold text-foreground">Created By</span>
              <p className="mt-0.5">—</p>
            </div>
            <div>
              <span className="font-bold text-foreground">Created At</span>
              <p className="mt-0.5">—</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border bg-muted/20">
          <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
            <div>
              <span className="font-bold text-foreground">Modified By</span>
              <p className="mt-0.5">—</p>
            </div>
            <div>
              <span className="font-bold text-foreground">Modified At</span>
              <p className="mt-0.5">—</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
      <Card className="shadow-none border bg-muted/20">
        <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
          <div>
            <span className="font-bold text-foreground">Created By</span>
            <p className="mt-0.5 text-foreground">{audit.created_by_name || "—"}</p>
          </div>
          <div>
            <span className="font-bold text-foreground">Created At</span>
            <p className="mt-0.5 text-foreground">{formatAuditDate(audit.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border bg-muted/20">
        <CardContent className="p-4 space-y-3 text-xs text-muted-foreground">
          <div>
            <span className="font-bold text-foreground">Modified By</span>
            <p className="mt-0.5 text-foreground">{audit.modified_by_name || "—"}</p>
          </div>
          <div>
            <span className="font-bold text-foreground">Modified At</span>
            <p className="mt-0.5 text-foreground">{formatAuditDate(audit.modified_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
