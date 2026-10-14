/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface FilterState {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSqft?: number;
  maxSqft?: number;
  minLotSizeArea?: number;
  maxLotSizeArea?: number;
  minTax?: number;
  maxTax?: number;
  minPricePerSft?: number;
  maxPricePerSft?: number;
  activeBedRoom?: string;
  activeBathRoom?: string;
  propertyType?: string;
  status?: string;
  whenListed?: string;
  minPriceInput?: string;
  maxPriceInput?: string;
  minSqftInput?: string;
  maxSqftInput?: string;
  minLotSqftInput?: string;
  maxLotSqftInput?: string;
  minPricePerSftInput?: string;
  maxPricePerSftInput?: string;
  minTaxInput?: string;
  maxTaxInput?: string;
  minAssociationFee?: number;
  maxAssociationFee?: number;
  minAssociationFeeInput?: string;
  maxAssociationFeeInput?: string;
  activeProperty?: string;
  neighborhood?: string;
  [key: string]: any;
}

interface ListingState {
  instances: Record<string, FilterState>;

  // Instance-specific actions
  getInstanceFilters: (id: string) => FilterState;
  setInstanceFilters: (id: string, filters: FilterState) => void;
  updateInstanceFilter: (id: string, key: string, value: any) => void;
  clearInstanceFilters: (id: string) => void;
  clearAllFilters: () => void;

  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  location: "",
  minPrice: 0,
  maxPrice: 100000000,
  minSqft: 0,
  maxSqft: 15000,
  minLotSizeArea: 0,
  maxLotSizeArea: 100000,
  minTax: 0,
  maxTax: 50000,
  minAssociationFee: 0,
  maxAssociationFee: 3000,
  minPriceInput: "",
  maxPriceInput: "",
  minSqftInput: "",
  maxSqftInput: "",
  minLotSqftInput: "",
  maxLotSqftInput: "",
  minPricePerSftInput: "",
  maxPricePerSftInput: "",
  minTaxInput: "",
  maxTaxInput: "",
  minAssociationFeeInput: "",
  maxAssociationFeeInput: "",
  activeBedRoom: "any",
  activeBathRoom: "any",
  propertyType: "any",
  status: "forSale",
  whenListed: "any",
  activeProperty: "any",
  neighborhood: "",
};

export const useListingStore = create<ListingState>((set, get) => ({
  instances: {},

  getInstanceFilters: (id) => {
    return get().instances[id] || DEFAULT_FILTERS;
  },

  setInstanceFilters: (id, filters) =>
    set((state) => ({
      instances: {
        ...state.instances,
        [id]: filters,
      },
    })),

  updateInstanceFilter: (id, key, value) =>
    set((state) => {
      const currentFilters = state.instances[id] || DEFAULT_FILTERS;
      return {
        instances: {
          ...state.instances,
          [id]: { ...currentFilters, [key]: value },
        },
      };
    }),

  clearInstanceFilters: (id) =>
    set((state) => ({
      instances: {
        ...state.instances,
        [id]: DEFAULT_FILTERS,
      },
    })),

  clearAllFilters: () => set({ instances: {} }),

  viewMode: "grid",
  setViewMode: (viewMode) => set({ viewMode }),

  selectedCity: "Vancouver",
  setSelectedCity: (city) => set({ selectedCity: city }),
}));
