import { serverFetch } from "./server-fetch";
import type {
  NavigationTreeResponse,
  CurrentUserResponse,
  UserCompany,
  ActivityCode,
} from "@/lib/types/navigation";

export async function getNavigationTree(): Promise<NavigationTreeResponse> {
  const res = await serverFetch<NavigationTreeResponse>("/navigation/tree");
  return res.data;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const res = await serverFetch<CurrentUserResponse>("/auth/me");
  return res.data;
}

export async function getMyCompanies(): Promise<UserCompany[]> {
  const res = await serverFetch<UserCompany[]>("/companies/mine");
  return res.data;
}

export async function checkCompanyPermission(
  companyId: string,
  menu: string,
  activity: ActivityCode
): Promise<boolean> {
  const res = await serverFetch<{ granted: boolean }>("/permissions/check", {
    query: {
      company_id: companyId,
      menu,
      activity,
    },
  });
  return Boolean(res.data?.granted);
}
