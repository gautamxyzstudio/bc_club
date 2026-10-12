/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActiveFilterPill, MapBounds } from "./mapTypes";

type UpdateFilter = (instance: "map", key: string, value: any) => void;

export const buildActiveFilterPills = ({
  filters,
  sortBy,
  setSortBy,
  updateInstanceFilter,
}: {
  filters: any;
  sortBy: string;
  setSortBy: (value: string) => void;
  updateInstanceFilter: UpdateFilter;
}): ActiveFilterPill[] => {
  const {
    location = "",
    status = "forSale",
    activeProperty = "any",
    minPrice,
    maxPrice,
    minSqft,
    maxSqft,
    minLotSizeArea,
    maxLotSizeArea,
    minTax,
    maxTax,
    structureType,
    features,
    whenListed,
    activeBedRoom,
    activeBathRoom,
    neighborhood = "",
  } = filters;

  const activeFilterPills: ActiveFilterPill[] = [];

  if (status && status !== "forSale") {
    const statusLabel =
      status === "sold" ? "Sold" : status === "expired" ? "Expired" : status;

    activeFilterPills.push({
      label: `Status: ${statusLabel}`,
      onRemove: () => updateInstanceFilter("map", "status", "forSale"),
    });
  }

  if (location) {
    const list = location.split(",").filter(Boolean);
    activeFilterPills.push({
      label: `Location: ${list.length > 4 ? `${list.slice(0, 4).join(", ")}, more.....` : list.join(", ")}`,
      onRemove: () => {
        updateInstanceFilter("map", "location", "");
        updateInstanceFilter("map", "neighborhood", "");
      },
    });
  }

  if (minPrice !== undefined && minPrice > 1000) {
    activeFilterPills.push({
      label: `Min Price: $${Number(minPrice).toLocaleString()}`,
      onRemove: () => updateInstanceFilter("map", "minPrice", 1000),
    });
  }

  if (maxPrice !== undefined && maxPrice < 100000000) {
    activeFilterPills.push({
      label: `Max Price: $${Number(maxPrice).toLocaleString()}`,
      onRemove: () => updateInstanceFilter("map", "maxPrice", 100000000),
    });
  }

  if (minSqft !== undefined && minSqft > 100) {
    activeFilterPills.push({
      label: `Min Area: ${minSqft} sqft`,
      onRemove: () => updateInstanceFilter("map", "minSqft", 100),
    });
  }

  if (maxSqft !== undefined && maxSqft < 15000) {
    activeFilterPills.push({
      label: `Max Area: ${maxSqft} sqft`,
      onRemove: () => updateInstanceFilter("map", "maxSqft", 15000),
    });
  }

  if (minLotSizeArea !== undefined && minLotSizeArea > 100) {
    activeFilterPills.push({
      label: `Min Lot Area: ${minLotSizeArea} sqft`,
      onRemove: () => updateInstanceFilter("map", "minLotSizeArea", 0),
    });
  }

  if (maxLotSizeArea !== undefined && maxLotSizeArea < 100000) {
    activeFilterPills.push({
      label: `Max Lot Area: ${maxLotSizeArea} sqft`,
      onRemove: () => updateInstanceFilter("map", "maxLotSizeArea", 100000),
    });
  }

  if (minTax !== undefined && minTax > 0) {
    activeFilterPills.push({
      label: `Min Tax: $${minTax}`,
      onRemove: () => updateInstanceFilter("map", "minTax", 0),
    });
  }

  if (maxTax !== undefined && maxTax < 50000) {
    activeFilterPills.push({
      label: `Max Tax: $${maxTax}`,
      onRemove: () => updateInstanceFilter("map", "maxTax", 50000),
    });
  }

  if (whenListed && whenListed !== "any") {
    activeFilterPills.push({
      label: `Listed: ${whenListed}`,
      onRemove: () => updateInstanceFilter("map", "whenListed", "any"),
    });
  }

  if (activeBedRoom && activeBedRoom !== "any") {
    activeFilterPills.push({
      label: `Beds: ${activeBedRoom}`,
      onRemove: () => updateInstanceFilter("map", "activeBedRoom", "any"),
    });
  }

  if (activeBathRoom && activeBathRoom !== "any") {
    activeFilterPills.push({
      label: `Baths: ${activeBathRoom}`,
      onRemove: () => updateInstanceFilter("map", "activeBathRoom", "any"),
    });
  }

  if (activeProperty && activeProperty !== "any") {
    activeFilterPills.push({
      label: `Property: ${activeProperty
        .split(",")
        .map((t: string) => t.replace(/([A-Z])/g, " $1").trim())
        .join(", ")}`,
      onRemove: () => updateInstanceFilter("map", "activeProperty", "any"),
    });
  }

  if (features) {
    activeFilterPills.push({
      label: `Feature: ${features
        .split(",")
        .map((feat: string) => feat.replace(/([A-Z])/g, " $1").trim())
        .join(", ")}`,
      onRemove: () => updateInstanceFilter("map", "features", ""),
    });
  }

  if (structureType) {
    activeFilterPills.push({
      label: `Type: ${structureType.split(",").join(", ")}`,
      onRemove: () => updateInstanceFilter("map", "structureType", ""),
    });
  }

  if (neighborhood) {
    const list = neighborhood.split(",").filter(Boolean);
    activeFilterPills.push({
      label: `Neighborhood: ${list.length > 4 ? `${list.slice(0, 4).join(", ")}, more.....` : list.join(", ")}`,
      onRemove: () => updateInstanceFilter("map", "neighborhood", ""),
    });
  }

  if (sortBy !== "newest") {
    const sortLabel =
      sortBy === "priceLow" ? "Price: Low→High" : "Price: High→Low";

    activeFilterPills.push({
      label: `Sort: ${sortLabel}`,
      onRemove: () => setSortBy("newest"),
    });
  }

  return activeFilterPills;
};

export const buildMapZoomParams = ({
  filters,
  mapBounds,
  mapZoomVal,
}: {
  filters: any;
  mapBounds: MapBounds | null;
  mapZoomVal: number | null;
}) => {
  const p: any = {};

  appendCommonParams(p, filters);

  if (
    filters.status &&
    filters.status !== "forSale" &&
    filters.status !== "any"
  ) {
    p.status = filters.status;
  }

  if (mapBounds) {
    p.north = mapBounds.north;
    p.south = mapBounds.south;
    p.east = mapBounds.east;
    p.west = mapBounds.west;
    if (mapZoomVal !== null) p.zoom = mapZoomVal;
  }

  return p;
};

const appendCommonParams = (params: any, filters: any) => {
  const {
    search,
    location,
    minPrice,
    maxPrice,
    minSqft,
    maxSqft,
    minLotSizeArea,
    maxLotSizeArea,
    minTax,
    maxTax,
    whenListed,
    features,
    structureType,
    activeBedRoom,
    activeBathRoom,
    activeProperty,
    neighborhood,
  } = filters;

  if (search) params.search = search;
  if (location) params.location = location;
  if (minPrice !== undefined && minPrice > 1000) params.minPrice = minPrice;
  if (maxPrice !== undefined && maxPrice < 100000000)
    params.maxPrice = maxPrice;
  if (minSqft !== undefined && minSqft > 100) params.minSqft = minSqft;
  if (maxSqft !== undefined && maxSqft < 15000) params.maxSqft = maxSqft;
  if (minLotSizeArea !== undefined && minLotSizeArea > 100)
    params.minLotSizeArea = minLotSizeArea;
  if (maxLotSizeArea !== undefined && maxLotSizeArea < 100000)
    params.maxLotSizeArea = maxLotSizeArea;
  if (minTax !== undefined && minTax > 0) params.minTax = minTax;
  if (maxTax !== undefined && maxTax < 50000) params.maxTax = maxTax;
  if (whenListed && whenListed !== "any") params.whenListed = whenListed;
  if (features) params.features = features;
  if (structureType) params.structureType = structureType;
  if (neighborhood) params.neighborhood = neighborhood;

  if (activeBedRoom && activeBedRoom !== "any")
    params.beds = activeBedRoom.replace("+", "");
  if (activeBathRoom && activeBathRoom !== "any")
    params.baths = activeBathRoom.replace("+", "");

  if (activeProperty && activeProperty !== "any") {
    if (activeProperty.includes(",")) {
      activeProperty.split(",").forEach((type: string, index: number) => {
        params[`filters[type][$in][${index}]`] = type;
      });
    } else {
      params.type = activeProperty;
    }
  }
};
