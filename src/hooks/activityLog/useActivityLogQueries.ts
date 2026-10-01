import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  logPropertySearchActivity,
  getUserActivityLogs,
  getActivityLogs,
  LogActivityPayload,
  ActivityLogItem,
} from "@/src/api/activityLog/activityLogApi";

export const activityLogKeys = {
  all: ["activityLogs"] as const,
  user: (userId: string | number) => [...activityLogKeys.all, "user", String(userId)] as const,
  list: (params?: any) => [...activityLogKeys.all, "list", params] as const,
};

export function useLogActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LogActivityPayload) => logPropertySearchActivity(payload),
    onSuccess: (_, variables) => {
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: activityLogKeys.user(variables.userId),
        });
      }
    },
  });
}

export function useGetUserActivityLogs(userId?: string | number, enabled: boolean = true) {
  return useQuery<ActivityLogItem[]>({
    queryKey: activityLogKeys.user(userId || ""),
    queryFn: () => (userId ? getUserActivityLogs(userId) : Promise.resolve([])),
    enabled: Boolean(userId) && enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useGetActivityLogs(params?: any, enabled: boolean = true) {
  return useQuery<ActivityLogItem[]>({
    queryKey: activityLogKeys.list(params),
    queryFn: () => getActivityLogs(params),
    enabled,
    staleTime: 1000 * 60,
  });
}
