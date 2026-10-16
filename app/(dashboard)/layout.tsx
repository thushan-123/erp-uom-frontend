import React from "react";
import { cookies } from "next/headers";
import { getNavigationTree, getCurrentUser } from "@/lib/api/navigation";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ItemSearchDialog } from "@/components/inventory/item/dialogs/item-search-dialog";
import { PERSONA_COOKIE } from "@/lib/auth/cookies";
import type { MockPersona } from "@/lib/types/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const persona = (cookieStore.get(PERSONA_COOKIE)?.value || "admin") as MockPersona;

  // Fetch nav tree and user profile on server
  const [tree, user] = await Promise.all([
    getNavigationTree(),
    getCurrentUser(),
  ]);

  return (
    <NavigationProvider
      initialTree={tree}
      initialUser={user}
      initialPersona={persona}
    >
      <AppShell>
        {children}
        <ItemSearchDialog />
      </AppShell>
    </NavigationProvider>
  );
}
