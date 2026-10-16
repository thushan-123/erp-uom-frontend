"use client";

import React, { createContext, useContext } from "react";
import { useStore } from "zustand";
import {
  createNavigationStore,
  type NavigationStore,
  type NavigationState,
} from "@/lib/stores/navigation-store";
import type {
  NavigationTreeResponse,
  CurrentUserResponse,
  MockPersona,
  ActivityCode,
} from "@/lib/types/navigation";

const NavigationContext = createContext<NavigationStore | null>(null);

export interface NavigationProviderProps {
  initialTree: NavigationTreeResponse;
  initialUser: CurrentUserResponse;
  initialPersona?: MockPersona;
  children: React.ReactNode;
}

export function NavigationProvider({
  initialTree,
  initialUser,
  initialPersona,
  children,
}: NavigationProviderProps) {
  const [store] = React.useState(() =>
    createNavigationStore({
      tree: initialTree,
      user: initialUser,
      persona: initialPersona || initialUser.persona,
    })
  );

  return (
    <NavigationContext.Provider value={store}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationStore<T>(
  selector: (state: NavigationState) => T
): T {
  const store = useContext(NavigationContext);
  if (!store) {
    throw new Error("useNavigationStore must be used within a NavigationProvider");
  }
  return useStore(store, selector);
}

export function useNavigationTree() {
  return useNavigationStore((state) => state.tree);
}

export function useCurrentUser() {
  return useNavigationStore((state) => state.user);
}

export function useCurrentPersona() {
  return useNavigationStore((state) => state.persona);
}

export function useSetPersona() {
  return useNavigationStore((state) => state.setPersona);
}

export function usePermission(menuCode: string, activity: ActivityCode) {
  return useNavigationStore((state) => state.checkPermission(menuCode, activity));
}
