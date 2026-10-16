import React from "react";
import { CategoryRecordScreen } from "@/components/master-data/item-category/category-record-screen";

export const metadata = {
  title: "Item Category Details — NexOne ERP",
  description: "View and edit item category details, numbering sequences, and audit history",
};

export default async function ItemCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);

  return <CategoryRecordScreen categoryId={categoryId} isNew={false} />;
}
