"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FullscreenToggle } from "./fullscreen-toggle";
import { UserMenu } from "./user-menu";
import { useItemUiStore } from "@/lib/stores/item-ui-store";

export function TopBar() {
  const pathname = usePathname();
  const setSearchDialogOpen = useItemUiStore((state) => state.setSearchDialogOpen);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchDialogOpen]);

  // Compute breadcrumbs based on pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((seg, idx) => {
    const formatted = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const isLast = idx === segments.length - 1;
    const href = "/" + segments.slice(0, idx + 1).join("/");
    return { title: formatted, href, isLast };
  });

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b bg-background px-3 sm:px-4">
      {/* Left: Trigger & Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 size-8 shrink-0" />
        <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
        <Breadcrumb className="truncate text-xs">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink href="/inventory/item-details">
                Inventory
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.length > 0 ? (
              breadcrumbItems.map((item, idx) => (
                <React.Fragment key={item.href}>
                  <BreadcrumbSeparator className={idx === 0 ? "hidden sm:inline-flex" : ""} />
                  <BreadcrumbItem className={!item.isLast ? "hidden md:inline-flex" : ""}>
                    {item.isLast ? (
                      <BreadcrumbPage className="font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                        {item.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))
            ) : (
              <>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Item Details</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Search, Notifications, Fullscreen, User Menu */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Search Icon Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSearchDialogOpen(true)}
          className="size-8 sm:hidden bg-muted/40 text-muted-foreground hover:text-foreground"
          aria-label="Search"
        >
          <Search className="size-3.5" />
        </Button>

        {/* Desktop / Tablet Search Pill */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchDialogOpen(true)}
          className="hidden h-8 gap-2 bg-muted/40 px-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex sm:w-48 md:w-56 sm:justify-between"
        >
          <div className="flex items-center gap-1.5">
            <Search className="size-3.5" />
            <span>Search items...</span>
          </div>
          <kbd className="pointer-events-none hidden h-4 select-none items-center gap-0.5 rounded border bg-background px-1 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span>⌘</span>K
          </kbd>
        </Button>

        <div className="hidden sm:inline-flex">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </div>

        <div className="hidden md:inline-flex">
          <FullscreenToggle />
        </div>
        <Separator orientation="vertical" className="hidden sm:inline-flex h-4" />
        <UserMenu />
      </div>
    </header>
  );
}
