"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MenuIcon } from "./menu-icon";
import type { NavigationMenuItem } from "@/lib/types/navigation";

interface NavItemProps {
  item: NavigationMenuItem;
}

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const isActive = Boolean(item.uri && (pathname === item.uri || pathname.startsWith(`${item.uri}/`)));

  if (item.is_locked) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger
            render={
              <SidebarMenuButton
                disabled
                aria-disabled="true"
                className="cursor-not-allowed opacity-60 hover:bg-transparent"
              >
                <MenuIcon code={item.code} className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
                <Badge
                  variant="outline"
                  className="ml-auto h-4 px-1 text-[9px] font-normal text-muted-foreground gap-1"
                >
                  <Lock className="size-2.5" />
                  Locked
                </Badge>
              </SidebarMenuButton>
            }
          />
          <TooltipContent side="right">
            {item.lock_reason || "Locked: Permission or module license required"}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.title}
        render={
          <Link
            href={item.uri || "#"}
            onClick={() => {
              if (isMobile) {
                setOpenMobile(false);
              }
            }}
          >
            <MenuIcon code={item.code} className="size-4 shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}
