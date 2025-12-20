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

export async function getCategories() {
  return unwrap<ServiceCategoryDto[]>(http.get<ApiResponse<ServiceCategoryDto[]>>("/services/categories"));
}

export async function getItems(categoryId?: number) {
  const qs = categoryId ? `?categoryId=${categoryId}` : "";
  return unwrap<ServiceItemDto[]>(http.get<ApiResponse<ServiceItemDto[]>>(`/services/items${qs}`));
}

export async function createCategory(req: { name: string; description?: string | null }) {
  return unwrap<ServiceCategoryDto>(http.post<ApiResponse<ServiceCategoryDto>>("/services/categories", req));
}

export async function createItem(req: {
  serviceCategoryId: number;
  name: string;
  description?: string | null;
  startingPrice?: number | null;
}) {
  return unwrap<ServiceItemDto>(http.post<ApiResponse<ServiceItemDto>>("/services/items", req));
}
