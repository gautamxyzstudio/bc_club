import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  StrapiUser,
  StrapiRole,
} from "@/src/api/users/usersApi";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: any) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
  roles: () => [...userKeys.all, "roles"] as const,
};

/**
 * Hook to fetch all users
 */
export function useGetUsers<TData = StrapiUser[]>(
  params?: any,
  options?: Omit<
    UseQueryOptions<StrapiUser[], Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<StrapiUser[], Error, TData, any>({
    queryKey: userKeys.list(params || {}),
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    
    ...options,
  });
}

/**
 * Hook to fetch single user by ID
 */
export function useGetUserById<TData = StrapiUser>(
  id: string | number,
  options?: Omit<
    UseQueryOptions<StrapiUser, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<StrapiUser, Error, TData, any>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
    ...options,
  });
}

/**
 * Hook to fetch available user roles
 */
export function useGetUserRoles<TData = StrapiRole[]>(
  options?: Omit<
    UseQueryOptions<StrapiRole[], Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<StrapiRole[], Error, TData, any>({
    queryKey: userKeys.roles(),
    queryFn: () => getUserRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<StrapiUser> & { password?: string }) =>
      createUser(data),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success(
        `User "${newUser.username || newUser.email}" created successfully!`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<StrapiUser>;
    }) => updateUser(id, data),
    onSuccess: (updatedUser, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.id),
      });
      toast.success(
        `User "${updatedUser.username || updatedUser.email}" updated successfully!`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}
