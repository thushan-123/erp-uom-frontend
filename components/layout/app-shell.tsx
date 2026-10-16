"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col overflow-hidden min-w-0">
          <TopBar />
          <div className="flex-1 overflow-auto min-w-0">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
