import React from "react";
import { ItemListScreen } from "@/components/inventory/item/item-list-screen";

export const metadata = {
  title: "Item Master Data — NexOne ERP",
  description: "Browse and filter common item master catalog and multi-company inventory settings",
};

export default function ItemDetailsPage() {
  return <ItemListScreen />;
}
