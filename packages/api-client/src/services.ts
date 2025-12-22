import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

let _itemsCache: any[] | null = null;
let _itemsInFlight: Promise<any[]> | null = null;

export function clearItemsCache() {
  _itemsCache = null;
  _itemsInFlight = null;
}

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

export async function getItems(force = false) {
  if (!force && _itemsCache) return _itemsCache;

  // Deduplicate concurrent calls
  if (!force && _itemsInFlight) return _itemsInFlight;

  _itemsInFlight = (async () => {
    const items = await unwrap<any[]>(
      http.get<any>(`/api/services/items`) // or `/services/items` depending on your chosen baseUrl rule
    );
    _itemsCache = items;
    _itemsInFlight = null;
    return items;
  })().catch((e) => {
    _itemsInFlight = null;
    throw e;
  });

  return _itemsInFlight;
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

export async function getItemById(id: string | number, force = false) {
  const items = await getItems(force);
  const key = String(id);
  return items.find((x: any) => String(x.id) === key) ?? null;
}

