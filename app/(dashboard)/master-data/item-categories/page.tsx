import React from "react";
import { CategoryListScreen } from "@/components/master-data/item-category/category-list-screen";

export const metadata = {
  title: "Item Categories — NexOne ERP",
  description: "Manage hierarchical item categories and numbering series across Main and Sub categories",
};

export default function ItemCategoriesPage() {
  return <CategoryListScreen />;
}
