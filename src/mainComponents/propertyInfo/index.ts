/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";
import { TableHeader } from "../../components/common/dynamicTable/DynamicTable";
import {
  getDaysAgoTime,
  sqftToAcresFormatted,
} from "../../utilities/utilities";

export const propertyDetailsHeaders: TableHeader[] = [
  { key: "label", label: "" },
  { key: "value", label: "", align: "right" },
];

export const calculatePropertyAge = (yearBuilt: number | string) => {
  if (!yearBuilt) return 0;

  const currentYear = new Date().getFullYear();
  return currentYear - Number(yearBuilt);
};

export const getPropertyDetailsRows = (
  property: any,
  isPrivate: boolean = false,
) => [
  {
    data: {
      label: "Property Type",
      value: property?.property_sub_type || "-",
    },
  },
  ...(property?.bedrooms || property?.bedrooms !== 0
    ? [
        {
          data: {
            label: "Bedrooms",
            value: property?.bedrooms ?? "-",
          },
        },
      ]
    : []),
  ...(property?.bathrooms || property?.bathrooms !== 0
    ? [
        {
          data: {
            label: "Bathrooms",
            value: property?.bathrooms ?? "-",
          },
        },
      ]
    : []),
  {
    data: {
      label: "Asking Price",
      value: property?.price
        ? `$${Number(property.price).toLocaleString()}`
        : "-",
    },
  },
  ...(property?.raw_data?.AssociationFee
    ? [
        {
          data: {
            label: "Maintenance Fee",
            value: property?.raw_data?.AssociationFee
              ? `$${property.raw_data.AssociationFee}`
              : "-",
          },
        },
      ]
    : []),
  {
    data: {
      label: "Listed On Website",
      value: !isPrivate
        ? "Sign in free to view date"
        : property?.OriginalEntryTimestamp
          ? dayjs(property.OriginalEntryTimestamp)
              .tz("America/Vancouver")
              .format("DD MMM, YYYY")
          : "-",
    },
    subRows: [
      {
        data: {
          label: "Days On Market",
          value: !isPrivate
            ? "Sign in free to view market days"
            : property?.OriginalEntryTimestamp
              ? `${getDaysAgoTime(property.OriginalEntryTimestamp)}`
              : "-",
        },
      },
      {
        data: {
          label: "Status",
          value: property?.standard_status || "-",
        },
      },
    ],
  },
  ...(property?.old_price > 0
    ? [
        {
          data: {
            label: "Modified Date",
            value: !isPrivate
              ? "Sign in free to view date"
              : property?.ModificationTimestamp
                ? dayjs(property.ModificationTimestamp)
                    .tz("America/Vancouver")
                    .format("DD MMM, YYYY")
                : "-",
          },
          subRows: [
            {
              data: {
                label: "Days On Market",
                value: !isPrivate
                  ? "Sign in free to view market days"
                  : property?.ModificationTimestamp
                    ? `${getDaysAgoTime(property.ModificationTimestamp)}`
                    : "-",
              },
            },
            {
              data: {
                label: "Status",
                value: property?.standard_status || "-",
              },
            },
          ],
        },
      ]
    : []),
  ...(property?.Living_area || property?.area
    ? [
        {
          data: {
            label: "Floor Area",
            value:
              property?.Living_area || property?.area
                ? `${property?.Living_area || property?.area} sq ft`
                : "-",
          },
          subRows: [
            {
              data: {
                label: "Price per sq ft",
                value:
                  property?.price && (property?.Living_area || property?.area)
                    ? `$${Math.round(property.price / (property?.Living_area || property?.area))}`
                    : "-",
              },
            },
          ],
        },
      ]
    : []),
  ...(property?.lot_size_area > 0
    ? [
        {
          data: {
            label: "Lot Size Area",
            value: property?.lot_size_area
              ? `${sqftToAcresFormatted(property.lot_size_area)} ac (${property?.lot_size_area} sq ft)`
              : "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.YearBuilt
    ? [
        {
          data: {
            label: "Year Built",
            value: property?.raw_data?.YearBuilt || "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.YearBuilt
    ? [
        {
          data: {
            label: "Age",
            value: property?.raw_data?.YearBuilt
              ?  calculatePropertyAge(property.raw_data.YearBuilt) > 1
                ? `${calculatePropertyAge(property.raw_data.YearBuilt)} years old`
                : `${calculatePropertyAge(property.raw_data.YearBuilt)} year old`
              : "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.ParcelNumber
    ? [
        {
          data: {
            label: "PID",
            value: property?.raw_data?.ParcelNumber
              ? `${property.raw_data.ParcelNumber}`
              : "-",
          },
        },
      ]
    : []),
  ...(property?.annual_tax
    ? [
        {
          data: {
            label: "Property Taxes",
            value: property?.annual_tax ? `$${property.annual_tax}` : "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.CommonInterest
    ? [
        {
          data: {
            label: "Ownership",
            value: property?.raw_data?.CommonInterest || "-",
          },
        },
      ]
    : []),
  {
    data: {
      label: "MLS® Number",
      value: property?.listing_id || property?.mls_number || "-",
    },
  },
  {
    data: {
      label: "Address",
      value: `${property?.address}`,
    },
  },
  ...(property?.raw_data?.ParkingTotal
    ? [
        {
          data: {
            label: "Parking",
            value: property?.raw_data?.ParkingTotal ?? "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.Heating?.length > 0
    ? [
        {
          data: {
            label: "Heating",
            value: property?.raw_data?.Heating?.join(", ") || "-",
          },
        },
      ]
    : []),
  ...(property?.raw_data?.WaterSource?.length > 0
    ? [
        {
          data: {
            label: "Water Supply",
            value: property?.raw_data?.WaterSource?.join(", ") || "-",
          },
        },
      ]
    : []),
];

export const roomHeaders: TableHeader[] = [
  { key: "room", label: "Room" },
  { key: "level", label: "Level", align: "center" },
  { key: "dimensions", label: "Dimensions", align: "right" },
];

export const getPropertyRoomRows = (property: any) => {
  const rooms = property?.rooms || [];
  return rooms
    .filter(
      (room: any) =>
        (room.RoomType || room.room_type) &&
        (room.RoomLevel || room.room_level),
    )
    .map((room: any) => {
      return {
        data: {
          room: room.RoomType || room.room_type,
          level: room.RoomLevel || room.room_level,
          dimensions:
            room.RoomDimensions || room.room_dimensions
              ? room.RoomDimensions || room.room_dimensions
              : `${room.RoomWidth || room.room_width} × ${room.RoomLength || room.room_length}`,
        },
      };
    });
};

export const buildingComplexHeaders: TableHeader[] = [
  { key: "label", label: "" },
  { key: "value", label: "", align: "right" },
];

export const buildingComplexRows = [
  {
    data: {
      label: "Building Name",
      value: "The Sea Breeze",
    },
  },
  {
    data: {
      label: "Active Listings",
      value: "1 listing",
    },
  },
  {
    data: {
      label: "Units",
      value: "61 units",
    },
  },
  {
    data: {
      label: "Storeys",
      value: "3 Storeys",
    },
  },
  {
    data: {
      label: "Year Built",
      value: "1967",
    },
  },
  {
    data: {
      label: "Neighborhood",
      value: "Kitsilano",
    },
  },
];

export const taxHistoryHeaders: TableHeader[] = [
  { key: "year", label: "Year" },
  { key: "land", label: "Land" },
  { key: "impr", label: "IMPR." },
  { key: "total", label: "TOTAL" },
  { key: "yoy", label: "YOY CHANGE", align: "center" },
];

export const taxHistoryRows = [
  {
    data: {
      year: "2025",
      land: "$586,000",
      impr: "$26,300",
      total: "$612,300",
      yoy: "+1.7%",
    },
  },
  {
    data: {
      year: "2024",
      land: "$586,000",
      impr: "$26,300",
      total: "$612,300",
      yoy: "+1.7%",
    },
  },
  {
    data: {
      year: "2023",
      land: "$600,000",
      impr: "$28,450",
      total: "$640,750",
      yoy: "+1.9%",
    },
  },
  {
    data: {
      year: "2022",
      land: "$640,000",
      impr: "$32,800",
      total: "$700,300",
      yoy: "+2.3%",
    },
  },
  {
    data: {
      year: "2021",
      land: "$660,000",
      impr: "$35,000",
      total: "$730,150",
      yoy: "+2.5%",
    },
  },
  {
    data: {
      year: "2020",
      land: "$620,000",
      impr: "$30,600",
      total: "$670,500",
      yoy: "+2.1%",
    },
  },
];

export const marketStatsHeaders: TableHeader[] = [
  { key: "type", label: "Apartment" },
  { key: "active", label: "All Active", align: "center" },
  { key: "price", label: "This Property", align: "right" },
];

export const marketStatsRows = [
  {
    data: {
      type: "Apartment",
      active: "1,250",
      price: "$594,900",
    },
  },
  {
    data: {
      type: "Apartment",
      active: "1,250",
      price: "$594,900",
    },
  },
  {
    data: {
      type: "Apartment",
      active: "1,250",
      price: "$594,900",
    },
  },
  {
    data: {
      type: "Apartment",
      active: "1,250",
      price: "$594,900",
    },
  },
  {
    data: {
      type: "Apartment",
      active: "1,250",
      price: "$594,900",
    },
  },
];

export { default as MarketWidget } from "@/src/components/marketWidget/MarketWidget";
export * from "@/src/components/marketWidget/types";
