import { http, unwrap } from "./http";
import type { ApiResponse, PagedResult } from "./types";

export type JobStatus = "New" | "Reviewed" | "Scheduled" | "InProgress" | "Completed" | "Cancelled";
export const JobStatusValues: JobStatus[] = ["New","Reviewed","Scheduled","InProgress","Completed","Cancelled"];

export type MediaType = "Before" | "After";

export type CreateJobRequest = {
  serviceItemId?: number | null;
  title: string;
  description: string;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  preferredDate1?: string | null;
  preferredDate2?: string | null;
};

export type JobSummaryDto = {
  id: string;
  title: string;
  status: JobStatus;
  createdAt: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
};

export type JobMediaDto = {
  id: string;
  type: MediaType;
  url: string;
  uploadedAt: string;
};

export type JobDetailDto = {
  id: string;
  serviceItemId: number | null;
  title: string;
  description: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  status: JobStatus;
  createdAt: string;
  preferredDate1: string | null;
  preferredDate2: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  media: JobMediaDto[];
};

export async function createJob(req: CreateJobRequest) {
  return unwrap<JobDetailDto>(http.post<ApiResponse<JobDetailDto>>("/jobs", req));
}

export async function getMyJobs() {
  return unwrap<JobSummaryDto[]>(http.get<ApiResponse<JobSummaryDto[]>>("/jobs/mine"));
}

export async function listJobs(params?: { page?: number; pageSize?: number; status?: JobStatus | "" }) {
  const p = new URLSearchParams();
  if (params?.page) p.set("page", String(params.page));
  if (params?.pageSize) p.set("pageSize", String(params.pageSize));
  if (params?.status) p.set("status", params.status);
  const qs = p.toString() ? `?${p.toString()}` : "";
  return unwrap<PagedResult<JobSummaryDto>>(http.get<ApiResponse<PagedResult<JobSummaryDto>>>(`/jobs${qs}`));
}

export async function getJob(id: string) {
  return unwrap<JobDetailDto>(http.get<ApiResponse<JobDetailDto>>(`/jobs/${id}`));
}

export async function updateJobStatus(id: string, req: { status: JobStatus; scheduledStart?: string | null; scheduledEnd?: string | null; internalNotes?: string | null }) {
  return unwrap<JobDetailDto>(http.patch<ApiResponse<JobDetailDto>>(`/jobs/${id}/status`, req));
}

export async function uploadJobMedia(id: string, type: MediaType, file: File) {
  const form = new FormData();
  form.append("file", file);
  return unwrap<JobMediaDto>(http.post<ApiResponse<JobMediaDto>>(`/jobs/${id}/media?type=${type}`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  }));
}
