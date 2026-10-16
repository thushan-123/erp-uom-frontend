import React from "react";
import {
  Boxes,
  Users,
  MapPin,
  Layers,
  FileSpreadsheet,
  Tag,
  Receipt,
  ShoppingBag,
  PackageCheck,
  Send,
  ArrowLeftRight,
  SlidersHorizontal,
  Factory,
  FileText,
  Scale,
  TrendingUp,
  Folder,
} from "lucide-react";

interface MenuIconProps {
  code?: string;
  className?: string;
}

export function MenuIcon({ code, className = "size-4" }: MenuIconProps) {
  switch (code) {
    case "item-details":
      return <Boxes className={className} />;
    case "business-partner":
      return <Users className={className} />;
    case "locations":
      return <MapPin className={className} />;
    case "item-categories":
      return <Layers className={className} />;
    case "inventory-gl-mapping":
      return <FileSpreadsheet className={className} />;
    case "sales-pricing":
      return <Tag className={className} />;
    case "purchase-pricing":
      return <Receipt className={className} />;
    case "purchase-order":
      return <ShoppingBag className={className} />;
    case "grn":
      return <PackageCheck className={className} />;
    case "stock-issue":
      return <Send className={className} />;
    case "stock-transfer":
      return <ArrowLeftRight className={className} />;
    case "stock-adjustments":
      return <SlidersHorizontal className={className} />;
    case "production-receipts":
      return <Factory className={className} />;
    case "grn-summary":
      return <FileText className={className} />;
    case "stock-balance":
      return <Scale className={className} />;
    case "stock-movement":
      return <TrendingUp className={className} />;
    default:
      return <Folder className={className} />;
  }
}
