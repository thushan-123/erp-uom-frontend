"use client";

import React from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ModuleGroup } from "./module-group";
import { useNavigationTree } from "@/components/providers/navigation-provider";

export function AppSidebar() {
  const tree = useNavigationTree();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-2.5">
        <Link
          href="/inventory/item-details"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
            <Boxes className="size-4" />
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-bold leading-none tracking-tight text-sidebar-foreground">
              NexOne ERP
            </span>
            <span className="text-[10px] text-muted-foreground font-normal">
              N1-Inventory
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-1">
        {tree.modules.map((module) => (
          <ModuleGroup key={module.app_label} module={module} />
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-3 py-2 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between">
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
