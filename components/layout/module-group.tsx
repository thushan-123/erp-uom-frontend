"use client";

import React, { useState } from "react";
import { ChevronDown, Lock } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { NavItem } from "./nav-item";
import type { NavigationModule } from "@/lib/types/navigation";

interface ModuleGroupProps {
  module: NavigationModule;
}

export function ModuleGroup({ module }: ModuleGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/module border-b border-sidebar-border/40 py-1"
    >
      <SidebarGroup className="p-0">
        <SidebarGroupLabel
          className="flex h-8 w-full cursor-pointer items-center justify-between px-3 text-xs font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
          render={
            <CollapsibleTrigger className="flex h-8 w-full cursor-pointer items-center justify-between px-3 text-xs font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent/50">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  MODULE:
                </span>
                <span className="truncate">{module.title}</span>
              </div>
              <div className="flex items-center gap-1">
                {module.is_locked && (
                  <Badge
                    variant="outline"
                    className="h-4 px-1 text-[9px] font-normal text-muted-foreground gap-0.5"
                  >
                    <Lock className="size-2.5" />
                    Locked
                  </Badge>
                )}
                <ChevronDown
                  className={`size-3.5 transition-transform duration-200 ${
                    isOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
            </CollapsibleTrigger>
          }
        />

        <CollapsibleContent>
          <SidebarGroupContent className="px-2 py-1">
            {/* Direct items not in a group (e.g. Item Details in Inventory) */}
            {module.items && module.items.length > 0 && (
              <SidebarMenu className="mb-2">
                {module.items.map((item) => (
                  <NavItem key={item.code} item={item} />
                ))}
              </SidebarMenu>
            )}

            {/* Groups */}
            {module.groups.map((group) => (
              <div key={group.title} className="mb-2.5 last:mb-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </div>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavItem key={item.code} item={item} />
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
