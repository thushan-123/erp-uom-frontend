"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Shield,
  Package,
  BadgePercent,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useCurrentUser,
  useCurrentPersona,
  useSetPersona,
} from "@/components/providers/navigation-provider";
import { USE_MOCK } from "@/lib/api/config";
import type { MockPersona } from "@/lib/types/navigation";

export function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();
  const persona = useCurrentPersona();
  const setPersona = useSetPersona();

  const handlePersonaSwitch = (newPersona: MockPersona) => {
    // Set cookie for server fetch
    document.cookie = `nexone_mock_persona=${newPersona}; path=/; max-age=86400; SameSite=Lax`;
    setPersona(newPersona);
    toast.success(`Switched persona to ${newPersona.toUpperCase()}`);
    router.refresh();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.info("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 px-2 hover:bg-accent"
          >
            <Avatar className="size-7 bg-primary text-primary-foreground font-semibold text-xs">
              <AvatarFallback>{user.initials || "AU"}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start text-left text-xs sm:flex">
              <span className="font-medium text-foreground">{user.fullname}</span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {persona} Persona
              </span>
            </div>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{user.fullname}</span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {persona}
              </Badge>
            </div>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {USE_MOCK && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Dev Mock Persona
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handlePersonaSwitch("admin")}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Shield className="size-3.5 text-primary" />
                  <span>Admin (Full Access)</span>
                </div>
                {persona === "admin" && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlePersonaSwitch("inventory")}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Package className="size-3.5 text-primary" />
                  <span>Inventory Officer</span>
                </div>
                {persona === "inventory" && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handlePersonaSwitch("sales")}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <BadgePercent className="size-3.5 text-primary" />
                  <span>Sales (View Only)</span>
                </div>
                {persona === "sales" && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => toast.info("User profile management is mock-only")}
            className="text-xs"
          >
            <User className="mr-2 size-3.5" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-xs text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 size-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
