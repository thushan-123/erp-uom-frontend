import React from "react";
import { CategoryRecordScreen } from "@/components/master-data/item-category/category-record-screen";

export const metadata = {
  title: "New Item Category — NexOne ERP",
  description: "Create a new Main or Sub Category with independent numbering sequence in NexOne ERP",
};

export default function NewItemCategoryPage() {
  return <CategoryRecordScreen isNew={true} />;
}
