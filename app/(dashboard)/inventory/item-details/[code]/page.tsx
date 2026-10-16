import React from "react";
import { ItemRecordScreen } from "@/components/inventory/item/item-record-screen";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return {
    title: `Item ${code} — NexOne ERP`,
    description: `View and edit item master data for item ${code}`,
  };
}

export default async function ItemRecordPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ItemRecordScreen initialCode={code} isNew={false} />;
}
