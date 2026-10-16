import { clientFetch } from "./client-fetch";
import type {
  CategoryDetail,
  CategoryListResponse,
  CategorySummary,
  MainCategoryOption,
} from "@/lib/types/item-category";

export interface CategoryCreateInput {
  category_code: string;
  category_name: string;
  category_level: "MAIN" | "SUB";
  parent_category_id?: number | null;
  description?: string;
  active?: boolean;
  number_series: {
    prefix?: string;
    start_number?: number;
  };
}

export interface CategoryUpdateInput {
  category_code?: string;
  category_name?: string;
  category_level?: "MAIN" | "SUB";
  parent_category_id?: number | null;
  description?: string;
  active?: boolean;
  number_series?: {
    prefix?: string;
    start_number?: number;
    next_number?: number;
  };
}

export interface ListCategoryParams {
  search?: string;
  level?: "MAIN" | "SUB" | "";
  status?: "active" | "inactive" | "";
  page?: number;
  page_size?: number;
}

export async function getCategorySummary(): Promise<CategorySummary> {
  const res = await clientFetch<CategorySummary>("/inventory/item-categories/summary");
  return res.data;
}

export async function listCategories(
  params: ListCategoryParams = {}
): Promise<CategoryListResponse> {
  const query: Record<string, string> = {};
  if (params.search) query.search = params.search;
  if (params.level) query.level = params.level;
  if (params.status) query.status = params.status;
  if (params.page !== undefined) query.page = String(params.page);
  if (params.page_size !== undefined) query.page_size = String(params.page_size);

  const res = await clientFetch<CategoryListResponse>(
    "/inventory/item-categories",
    { query }
  );
  return res.data;
}

export async function getMainCategoryOptions(): Promise<MainCategoryOption[]> {
  const res = await clientFetch<MainCategoryOption[]>(
    "/inventory/item-categories/main-options"
  );
  return res.data;
}

export async function getCategoryDetail(
  categoryId: number
): Promise<CategoryDetail> {
  const res = await clientFetch<CategoryDetail>(
    `/inventory/item-categories/${categoryId}`
  );
  return res.data;
}

export async function createCategory(
  payload: CategoryCreateInput
): Promise<CategoryDetail> {
  const res = await clientFetch<CategoryDetail>("/inventory/item-categories", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateCategory(
  categoryId: number,
  payload: CategoryUpdateInput
): Promise<CategoryDetail> {
  const res = await clientFetch<CategoryDetail>(
    `/inventory/item-categories/${categoryId}`,
    {
      method: "PUT",
      body: payload,
    }
  );
  return res.data;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  await clientFetch<void>(`/inventory/item-categories/${categoryId}`, {
    method: "DELETE",
  });
}
