import { clientFetch } from "./client-fetch";
import type {
  Item,
  ItemListSummary,
  PaginatedResponse,
  ItemLookups,
} from "@/lib/types/item";

export interface ItemFilterParams {
  search?: string;
  company_id?: string;
  main_category?: string;
  sub_category?: string;
  brand?: string;
  status?: string;
  flag?: string;
  page?: number;
  page_size?: number;
}

export async function listItems(
  params: ItemFilterParams = {}
): Promise<PaginatedResponse<ItemListSummary>> {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.company_id) query.company_id = params.company_id;
  if (params.main_category) query.main_category = params.main_category;
  if (params.sub_category) query.sub_category = params.sub_category;
  if (params.brand) query.brand = params.brand;
  if (params.status) query.status = params.status;
  if (params.flag) query.flag = params.flag;
  if (params.page) query.page = String(params.page);
  if (params.page_size) query.page_size = String(params.page_size);

  const res = await clientFetch<PaginatedResponse<ItemListSummary>>(
    "/inventory/items",
    { query }
  );
  return res.data;
}

export async function getItem(code: string): Promise<Item> {
  const res = await clientFetch<Item>(`/inventory/items/${code}`);
  return res.data;
}

export async function createItem(payload: Partial<Item>): Promise<Item> {
  const res = await clientFetch<Item>("/inventory/items", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateItem(
  code: string,
  payload: Partial<Item>
): Promise<Item> {
  const res = await clientFetch<Item>(`/inventory/items/${code}`, {
    method: "PUT",
    body: payload,
  });
  return res.data;
}

export async function deleteItem(
  code: string
): Promise<{ success: boolean; deleted_code: string }> {
  const res = await clientFetch<{ success: boolean; deleted_code: string }>(
    `/inventory/items/${code}`,
    { method: "DELETE" }
  );
  return res.data;
}

export async function allocateCompany(
  code: string,
  companyId: string
): Promise<Item> {
  const res = await clientFetch<Item>(`/inventory/items/${code}/allocations`, {
    method: "POST",
    body: { company_id: companyId },
  });
  return res.data;
}

export async function updateCompanyAllocationActive(
  code: string,
  companyId: string,
  isActive: boolean
): Promise<Item> {
  const res = await clientFetch<Item>(
    `/inventory/items/${code}/allocations/${companyId}`,
    {
      method: "PATCH",
      body: { is_active: isActive },
    }
  );
  return res.data;
}

export async function getItemLookups(): Promise<ItemLookups> {
  const res = await clientFetch<ItemLookups>("/inventory/lookups");
  return res.data;
}

export async function searchItems(
  search: string,
  companyId: string = ""
): Promise<ItemListSummary[]> {
  const query: Record<string, string> = {
    search,
    page_size: "50",
  };
  if (companyId) query.company_id = companyId;

  const res = await clientFetch<PaginatedResponse<ItemListSummary>>(
    "/inventory/items",
    { query }
  );
  return res.data.items;
}
