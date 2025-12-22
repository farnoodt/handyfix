import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

export type ReviewDto = { id: string; rating: number; comment: string | null; createdAt: string };

export async function createReview(jobId: string, req: { rating: number; comment?: string | null }) {
  return unwrap<ReviewDto>(http.post<ApiResponse<ReviewDto>>(`/api/jobs/${jobId}/reviews`, req));
}

export async function getReview(jobId: string) {
  return unwrap<ReviewDto | null>(http.get<ApiResponse<ReviewDto | null>>(`/api/jobs/${jobId}/reviews`));
}
