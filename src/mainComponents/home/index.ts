export const fallbackCities = [
  "Abbotsford",
  "Burnaby",
  "Coquitlam",
  "Langley",
  "Maple Ridge",
  "North Vancouver",
  "Prince George",
  "Richmond",
  "Surrey",
  "Vancouver",
];

export const cities = fallbackCities;

export interface PropertySoldData {
  type: string;
  sold: number;
  changePercent: number;
  marketCondition: "Seller's Market" | "Buyer's Market" | "Balanced";
  gaugeValue: number; // 0-100, where 0-33 = Buyer's Market (yellow), 34-66 = Balanced (green), 67-100 = Seller's Market (red)
  tip: string;
}

export const propertyDataByCity: Record<string, PropertySoldData[]> = {
  Surrey: [
    {
      type: "Detached Homes",
      sold: 520,
      changePercent: 12,
      marketCondition: "Seller's Market",
      gaugeValue: 78,
      tip: "High demand—over 25 sold per 100 listings",
    },
    {
      type: "Townhouse",
      sold: 240,
      changePercent: -5,
      marketCondition: "Buyer's Market",
      gaugeValue: 30,
      tip: "Lower competition—under 12 sold per 100 listings",
    },
    {
      type: "Condos/Apartments",
      sold: 310,
      changePercent: 10,
      marketCondition: "Balanced",
      gaugeValue: 55,
      tip: "Moderate activity—around 20–25 sold per 100 listings",
    },
  ],

  Vancouver: [
    {
      type: "Detached Homes",
      sold: 680,
      changePercent: 20,
      marketCondition: "Seller's Market",
      gaugeValue: 85,
      tip: "Very high activity—strong seller advantage",
    },
    {
      type: "Townhouse",
      sold: 300,
      changePercent: -2,
      marketCondition: "Balanced",
      gaugeValue: 50,
      tip: "Market stabilizing—moderate buyer interest",
    },
    {
      type: "Condos/Apartments",
      sold: 900,
      changePercent: 18,
      marketCondition: "Seller's Market",
      gaugeValue: 70,
      tip: "Condos selling quickly—competitive offers",
    },
  ],

  "Prince George": [
    {
      type: "Detached Homes",
      sold: 320,
      changePercent: -3,
      marketCondition: "Buyer's Market",
      gaugeValue: 32,
      tip: "Detached home supply outweighs demand",
    },
    {
      type: "Townhouse",
      sold: 205,
      changePercent: 8,
      marketCondition: "Balanced",
      gaugeValue: 50,
      tip: "Townhouses steady—fair buyer competition",
    },
    {
      type: "Condos/Apartments",
      sold: 190,
      changePercent: 3,
      marketCondition: "Balanced",
      gaugeValue: 47,
      tip: "Healthy condo market—consistent sales",
    },
  ],
};
