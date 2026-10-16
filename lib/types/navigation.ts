export type ActivityCode = "view" | "create" | "edit" | "delete";

export interface NavigationMenuItem {
  code: string;
  title: string;
  uri: string | null;
  group?: string | null;
  is_locked: boolean;
  lock_reason?: string;
  activities: ActivityCode[];
  children?: NavigationMenuItem[];
}

export interface NavigationGroup {
  title: string;
  items: NavigationMenuItem[];
}

export interface NavigationModule {
  app_label: string;
  title: string;
  is_locked: boolean;
  lock_reason?: string;
  groups: NavigationGroup[];
  items?: NavigationMenuItem[]; // Direct items not in groups
}

export interface NavigationTreeResponse {
  modules: NavigationModule[];
}

export type MockPersona = "admin" | "inventory" | "sales";

export interface CurrentUserResponse {
  username: string;
  email: string;
  fullname: string;
  display_name: string;
  is_tenant_admin: boolean;
  is_super_admin: boolean;
  persona: MockPersona;
  initials: string;
}

export interface UserCompany {
  id: string;
  code: string;
  name: string;
  currency: string;
  is_default: boolean;
}
