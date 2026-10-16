import React from "react";
import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = "/" + (slug || []).join("/");
  const title = (slug || [])
    .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" › ");

  return (
    <div className="flex h-full min-h-[70vh] items-center justify-center p-6">
      <Empty className="max-w-md border border-dashed bg-card/50 p-8 shadow-xs">
        <EmptyMedia variant="icon">
          <Construction className="size-5 text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle className="text-base font-semibold">
            {title || "Module Screen"}
          </EmptyTitle>
          <EmptyDescription>
            This screen is not implemented yet. The ERP backend for this module
            ({path}) will be connected in a future release.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href="/inventory/item-details">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Return to Item Details
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
