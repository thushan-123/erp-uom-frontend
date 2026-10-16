import { createStore } from "zustand/vanilla";
import type {
  NavigationTreeResponse,
  CurrentUserResponse,
  MockPersona,
  ActivityCode,
} from "@/lib/types/navigation";

export interface NavigationState {
  tree: NavigationTreeResponse;
  user: CurrentUserResponse;
  persona: MockPersona;
  setPersona: (persona: MockPersona) => void;
  checkPermission: (menuCode: string, activity: ActivityCode) => boolean;
}

export type NavigationStore = ReturnType<typeof createNavigationStore>;

export function createNavigationStore(initProps: {
  tree: NavigationTreeResponse;
  user: CurrentUserResponse;
  persona?: MockPersona;
}) {
  return createStore<NavigationState>()((set, get) => ({
    tree: initProps.tree,
    user: initProps.user,
    persona: initProps.persona || initProps.user.persona || "admin",
    setPersona: (persona) => {
      set((state) => ({
        persona,
        user: { ...state.user, persona },
      }));
    },
    checkPermission: (menuCode: string, activity: ActivityCode) => {
      const state = get();
      const persona = state.persona;

      // Mock persona gate:
      // Admin: everything granted
      if (persona === "admin") return true;

      // Inventory persona: all Inventory + Master Data, but Sales Pricing locked
      if (persona === "inventory") {
        if (menuCode === "sales-pricing") return false;
        return true;
      }

      // Sales persona: Item Details view only, no create/edit/delete; other inventory locked
      if (persona === "sales") {
        if (menuCode === "item-details") {
          return activity === "view";
        }
        return false;
      }

      const matchCode = (code: string) =>
        code === menuCode ||
        code === menuCode.replace(/-/g, "_") ||
        code === menuCode.replace(/_/g, "-");

      // Default: inspect tree for menu item activity
      for (const mod of state.tree.modules) {
        if (mod.is_locked) continue;
        for (const grp of mod.groups) {
          const found = grp.items.find((item) => matchCode(item.code));
          if (found) {
            if (found.is_locked) return false;
            return found.activities.includes(activity);
          }
        }
        if (mod.items) {
          const found = mod.items.find((item) => matchCode(item.code));
          if (found) {
            if (found.is_locked) return false;
            return found.activities.includes(activity);
          }
        }
      }
      return true;
    },
  }));
}
