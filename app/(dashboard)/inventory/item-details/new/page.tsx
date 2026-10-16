import React from "react";
import { ItemRecordScreen } from "@/components/inventory/item/item-record-screen";

export const metadata = {
  title: "New Item — NexOne ERP",
  description: "Create a new item in the common item master catalog",
};

export default function NewItemPage() {
  return <ItemRecordScreen isNew={true} />;
}
