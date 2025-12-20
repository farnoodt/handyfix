import { http, unwrap } from "./http";
import type { ApiResponse } from "./types";

export type BlogPostListDto = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  createdAt: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
};

export type BlogPostDetailDto = BlogPostListDto & { contentMarkdown: string };

export function listBlog(publishedOnly = true) {
  return unwrap<BlogPostListDto[]>(http.get<ApiResponse<BlogPostListDto[]>>(`/blog?publishedOnly=${publishedOnly}`));
}

export function getBlog(slug: string, allowUnpublished = false) {
  return unwrap<BlogPostDetailDto>(
    http.get<ApiResponse<BlogPostDetailDto>>(`/blog/${slug}?allowUnpublished=${allowUnpublished}`)
  );
}

export function upsertBlog(
  id: string,
  req: { title: string; summary: string; contentMarkdown: string; coverImageUrl?: string | null; published: boolean }
) {
  return unwrap<BlogPostDetailDto>(http.put<ApiResponse<BlogPostDetailDto>>(`/blog/${id}`, req));
}

export function deleteBlog(id: string) {
  return unwrap<any>(http.delete<ApiResponse<any>>(`/blog/${id}`));
}
