import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getHomeEvaluationRequests,
  getHomeEvaluationRequestById,
  deleteHomeEvaluationRequest,
  HomeEvaluationRequestItem,
} from "@/src/api/homeEvaluation/homeEvaluationApi";

export const homeEvaluationKeys = {
  all: ["homeEvaluationRequests"] as const,
  lists: () => [...homeEvaluationKeys.all, "list"] as const,
  list: (params: any) => [...homeEvaluationKeys.lists(), params] as const,
  details: () => [...homeEvaluationKeys.all, "detail"] as const,
  detail: (id: string | number) => [...homeEvaluationKeys.details(), id] as const,
};

/**
 * Hook to fetch all home evaluation requests
 */
export function useGetHomeEvaluationRequests<TData = HomeEvaluationRequestItem[]>(
  params?: any,
  options?: Omit<
    UseQueryOptions<HomeEvaluationRequestItem[], Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<HomeEvaluationRequestItem[], Error, TData, any>({
    queryKey: homeEvaluationKeys.list(params || {}),
    queryFn: () => getHomeEvaluationRequests(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch a single home evaluation request by ID
 */
export function useGetHomeEvaluationRequestById<TData = HomeEvaluationRequestItem>(
  id: string | number,
  options?: Omit<
    UseQueryOptions<HomeEvaluationRequestItem, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<HomeEvaluationRequestItem, Error, TData, any>({
    queryKey: homeEvaluationKeys.detail(id),
    queryFn: () => getHomeEvaluationRequestById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
    ...options,
  });
}

/**
 * Hook to delete a home evaluation request
 */
export function useDeleteHomeEvaluationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteHomeEvaluationRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeEvaluationKeys.lists() });
      toast.success("Home evaluation request deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete evaluation request");
    },
  });
}
