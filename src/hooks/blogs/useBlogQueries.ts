import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogMedia,
} from "@/src/api/blogs/blogsApi";

export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (params: any) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (slug: string) => [...blogKeys.details(), slug] as const,
};

/**
 * Hook to fetch all blogs with filtering & sorting
 */
export function useGetBlogs<TData = any>(
  params?: any,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<any, Error, TData, any>({
    queryKey: blogKeys.list(params || {}),
    queryFn: () => getBlogs(params),
    staleTime: 1000 * 60 * 3, // 3 minutes
    ...options,
  });
}

/**
 * Hook to fetch single blog by slug
 */
export function useGetBlogBySlug<TData = any>(
  slug: string,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<any, Error, TData, any>({
    queryKey: blogKeys.detail(slug),
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to create a new blog post
 */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogData: any) => createBlog(blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Blog created and published successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create blog post");
    },
  });
}

/**
 * Hook to update a blog post by slug
 */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, blogData }: { slug: string; blogData: any }) =>
      updateBlog(slug, blogData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.slug) });
      toast.success("Blog updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update blog post");
    },
  });
}

/**
 * Hook to delete a blog post by slug
 */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => deleteBlog(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Blog post deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete blog post");
    },
  });
}

/**
 * Hook to upload media to Strapi
 */
export function useUploadBlogMedia() {
  return useMutation({
    mutationFn: (file: File) => uploadBlogMedia(file),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload media file");
    },
  });
}
