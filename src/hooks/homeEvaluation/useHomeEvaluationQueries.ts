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
  createCallHistory,
  deleteCallHistory,
  HomeEvaluationRequestItem,
  CallHistoryItem,
  DeleteHomeEvaluationPayload,
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
 * Hook to delete a home evaluation request and its call histories
 */
export function useDeleteHomeEvaluationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteHomeEvaluationPayload) =>
      deleteHomeEvaluationRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeEvaluationKeys.all });
      toast.success("Home evaluation request deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete evaluation request");
    },
  });
}

/**
 * Hook to create a call history record
 */
export function useCreateCallHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      callAt: string;
      home_evaluation_request: string | number;
    }) => createCallHistory(payload),
    onSuccess: (newCall, variables) => {
      // Immediately update React Query list cache so dashboard table and modals update instantly
      queryClient.setQueriesData<HomeEvaluationRequestItem[]>(
        { queryKey: homeEvaluationKeys.lists() },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((item) => {
            const matches =
              (item.documentId &&
                item.documentId === variables.home_evaluation_request) ||
              (item.id &&
                String(item.id) === String(variables.home_evaluation_request));

            if (!matches) return item;

            const existing = item.call_histories || [];
            const alreadyExists = existing.some(
              (c) =>
                (c.documentId && c.documentId === newCall.documentId) ||
                (c.id && c.id === newCall.id),
            );

            const updated = alreadyExists
              ? existing
              : [newCall, ...existing].sort(
                  (a, b) =>
                    new Date(b.callAt || b.createdAt || 0).getTime() -
                    new Date(a.callAt || a.createdAt || 0).getTime(),
                );

            return {
              ...item,
              call_histories: updated,
            };
          });
        },
      );

      // Invalidate queries to confirm sync with server
      queryClient.invalidateQueries({ queryKey: homeEvaluationKeys.all });
      toast.success("Call log created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log call");
    },
  });
}

/**
 * Hook to delete a call history record
 */
export function useDeleteCallHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteCallHistory(id),
    onSuccess: (_, deletedId) => {
      // Immediately purge the deleted call from React Query cache so it disappears instantly
      queryClient.setQueriesData<HomeEvaluationRequestItem[]>(
        { queryKey: homeEvaluationKeys.lists() },
        (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return oldData;
          return oldData.map((item) => {
            if (!item.call_histories) return item;
            const updatedHistories = item.call_histories.filter(
              (ch) =>
                ch.id !== deletedId &&
                ch.documentId !== deletedId &&
                String(ch.id) !== String(deletedId) &&
                String(ch.documentId) !== String(deletedId),
            );
            return {
              ...item,
              call_histories: updatedHistories,
            };
          });
        },
      );

      // Invalidate queries to confirm fresh backend sync
      queryClient.invalidateQueries({ queryKey: homeEvaluationKeys.all });
      toast.success("Call record removed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete call record");
    },
  });
}
