import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

export type ServiceCategoryDto = { id: number; name: string; description: string | null };
export type ServiceItemDto = {
  id: number;
  serviceCategoryId: number;
  name: string;
  description: string | null;
  startingPrice: number | null;
};

export function getCategories() {
  return unwrap<ServiceCategoryDto[]>(http.get<ApiResponse<ServiceCategoryDto[]>>("/api/services/categories"));
}

export function getItems(categoryId?: number) {
  const qs = categoryId ? `?categoryId=${categoryId}` : "";
  return unwrap<ServiceItemDto[]>(http.get<ApiResponse<ServiceItemDto[]>>(`/api/services/items${qs}`));
}

export function createCategory(req: { name: string; description?: string | null }) {
  return unwrap<ServiceCategoryDto>(http.post<ApiResponse<ServiceCategoryDto>>("/api/services/categories", req));
}

export function createItem(req: {
  serviceCategoryId: number;
  name: string;
  description?: string | null;
  startingPrice?: number | null;
}) {
  return unwrap<ServiceItemDto>(http.post<ApiResponse<ServiceItemDto>>("/api/services/items", req));
}
