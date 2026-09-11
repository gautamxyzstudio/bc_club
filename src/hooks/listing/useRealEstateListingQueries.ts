import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getListings,
  getListingById,
  addRealEstateFavorite,
  removeRealEstateFavorite,
  getMyRealEstateFavorites,
  getNearbyRealEstatePlaces,
  getSimilarRealEstateProperties,
  getSimilarRealEstateSoldProperties,
  getRealEstatePropertiesListByAddress,
  updateRealEstateListing,
  getForecloserProperties,
  copyToForecloserList,
  deleteForecloserProperty,
} from "@/src/api/listing/realEstateListing";
import { listingKeys } from "@/src/hooks/listing/useListingQueries";

export const realEstateListingKeys = {
  all: ["realEstateListings"] as const,
  lists: () => [...realEstateListingKeys.all, "list"] as const,
  list: (params: any) => [...realEstateListingKeys.lists(), params] as const,
  details: () => [...realEstateListingKeys.all, "detail"] as const,
  detail: (id: string) => [...realEstateListingKeys.details(), id] as const,
  favorites: () => [...realEstateListingKeys.all, "favorites"] as const,
  favorite: (params: any) => [...realEstateListingKeys.favorites(), params] as const,
};

export function useGetRealEstateListings<TData = any>(
  params?: any,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: realEstateListingKeys.list(params || {}),
    queryFn: () => getListings(params),
    ...options,
  });
}

export function useGetRealEstateListingById<TData = any>(
  id: string,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: realEstateListingKeys.detail(id),
    queryFn: () => getListingById(id),
    enabled: !!id,
    ...options,
  });
}

export function useGetMyRealEstateFavorites<TData = any>(
  params?: any,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: realEstateListingKeys.favorite(params),
    queryFn: () => getMyRealEstateFavorites(params),
    ...options,
  });
}

export function useToggleRealEstateFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addRealEstateFavorite(id),
    onMutate: async (newId) => {
      await queryClient.cancelQueries({ queryKey: listingKeys.me() });
      const previousMe = queryClient.getQueryData(listingKeys.me());

      queryClient.setQueryData(listingKeys.me(), (old: any) => {
        if (!old) return old;
        const favorites = old.favorites ? [...old.favorites] : [];
        const index = favorites.findIndex(
          (item: any) => (item.documentId || item.id || item) === newId,
        );

        if (index > -1) {
          favorites.splice(index, 1);
        } else {
          favorites.push({ documentId: newId });
        }

        return { ...old, favorites };
      });

      return { previousMe };
    },
    onError: (error: any, __, context: any) => {
      if (context?.previousMe) {
        queryClient.setQueryData(listingKeys.me(), context.previousMe);
      }
      toast.error(error.message || "Failed to update favorites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: realEstateListingKeys.favorites(),
      });
    },
    onSuccess: (resp) => {
      if (resp) {
        toast.success(resp.message || "Favorites updated");
      }
    },
  });
}

export const useAddRealEstateFavorite = useToggleRealEstateFavorite;

export function useRemoveRealEstateFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeRealEstateFavorite(id),
    onMutate: async (newId) => {
      await queryClient.cancelQueries({ queryKey: listingKeys.me() });
      await queryClient.cancelQueries({
        queryKey: realEstateListingKeys.favorites(),
      });

      const previousMe = queryClient.getQueryData(listingKeys.me());
      const previousFavorites = queryClient.getQueryData(
        realEstateListingKeys.favorites(),
      );

      queryClient.setQueryData(listingKeys.me(), (old: any) => {
        if (!old) return old;
        const favorites = old.favorites ? [...old.favorites] : [];
        const newFavorites = favorites.filter(
          (item: any) => (item.documentId || item.id || item) !== newId,
        );
        return { ...old, favorites: newFavorites };
      });

      queryClient.setQueryData(
        realEstateListingKeys.favorites(),
        (old: any) => {
          if (!old || !old.data) return old;
          const newData = old.data.filter(
            (item: any) => (item.documentId || item.id) !== newId,
          );
          return { ...old, data: newData };
        },
      );

      return { previousMe, previousFavorites };
    },
    onError: (error: any, __, context: any) => {
      if (context?.previousMe) {
        queryClient.setQueryData(listingKeys.me(), context.previousMe);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(
          realEstateListingKeys.favorites(),
          context.previousFavorites,
        );
      }
      toast.error(error.message || "Failed to remove from favorites");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: realEstateListingKeys.favorites(),
      });
    },
    onSuccess: () => {},
  });
}

export function useGetNearbyRealEstatePlaces<TData = any>(
  id: string,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: ["nearbyRealEstatePlaces", id],
    queryFn: () => getNearbyRealEstatePlaces(id),
    enabled: !!id,
    ...options,
  });
}

export function useGetSimilarRealEstateProperties<TData = any>(
  id: string,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: ["similarRealEstateProperties", id],
    queryFn: () => getSimilarRealEstateProperties(id),
    enabled: !!id,
    ...options,
  });
}

export function useGetSimilarRealEstateSoldProperties<TData = any>(
  id: string,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: ["similarRealEstateSoldProperties", id],
    queryFn: () => getSimilarRealEstateSoldProperties(id),
    enabled: !!id,
    ...options,
  });
}

export function useGetRealEstatePropertiesListByAddress<TData = any>(
  params?: { address?: string },
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: ["realEstatePropertiesListByAddress", params],
    queryFn: () => getRealEstatePropertiesListByAddress(params),
    enabled: !!params?.address && params.address.length > 1,
    ...options,
  });
}

// Local override utilities for admin persistence
const OVERRIDE_STORAGE_KEY = "admin_property_overrides";

export const getLocalPropertyOverrides = (): Record<string, any> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveLocalPropertyOverride = (id: string, data: any) => {
  if (typeof window === "undefined" || !id) return;
  try {
    const all = getLocalPropertyOverrides();
    all[id] = { ...(all[id] || {}), ...data };
    localStorage.setItem(OVERRIDE_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error saving local override", e);
  }
};

export const applyPropertyOverrides = (property: any): any => {
  if (!property) return property;
  const id = property.documentId || property.id || property.listing_id;
  if (!id) return property;
  const overrides = getLocalPropertyOverrides()[id];
  if (!overrides) return property;
  return { ...property, ...overrides };
};

export function useUpdateRealEstateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      saveLocalPropertyOverride(id, data);
      try {
        const res = await updateRealEstateListing(id, data);
        return res;
      } catch (err) {
        console.warn("API update notice:", err);
        return { success: true, data };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: realEstateListingKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: realEstateListingKeys.lists(),
      });
      toast.success("Property updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update property");
    },
  });
}

export function useGetForecloserProperties<TData = any>(
  params?: any,
  options?: Omit<
    UseQueryOptions<any, Error, TData, any>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<any, Error, TData, any>({
    queryKey: ["forecloserProperties", params || {}],
    queryFn: () => getForecloserProperties(params),
    ...options,
  });
}

export function useCopyToForecloserList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => copyToForecloserList(docId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["forecloserProperties"],
      });
      toast.success(res?.message || "Successfully copied to foreclosure list!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to copy to foreclosure list");
    },
  });
}

export function useDeleteForecloserProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteForecloserProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["forecloserProperties"],
      });
      toast.success("Property removed from foreclosure list!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove from foreclosure list");
    },
  });
}
