export type CategoryLevel = "MAIN" | "SUB";

export interface NumberSeriesDetail {
  series_code: string;
  scope_type: string;
  prefix: string;
  start_number: number;
  next_number: number;
  number_length: number;
  separator: string | null;
  active: boolean;
}

export interface AuditDetail {
  created_by_name: string;
  created_at: string;
  modified_by_name: string;
  modified_at: string;
}

export interface CategoryListItem {
  category_id: number;
  category_code: string;
  category_name: string;
  category_level: CategoryLevel;
  parent_category_id: number | null;
  parent_category_code: string | null;
  parent_category_name: string | null;
  prefix: string;
  next_number: number;
  items_count: number;
  active: boolean;
}

export interface CategoryListResponse {
  items: CategoryListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CategoryDetail extends CategoryListItem {
  description: string;
  number_series: NumberSeriesDetail;
  audit: AuditDetail;
}

export interface CategorySummary {
  total: number;
  main_count: number;
  sub_count: number;
  items_assigned: number;
}

export interface MainCategoryOption {
  category_id: number;
  category_code: string;
  category_name: string;
}

export interface CategoryFormData {
  category_code: string;
  category_name: string;
  category_level: CategoryLevel;
  parent_category_id: number | null;
  description: string;
  active: boolean;
  prefix: string;
  start_number: number;
  next_number: number;
}
