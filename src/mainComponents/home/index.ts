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
  gaugeValue: number; // 0-32 (SAL %), where <12% = Buyer's Market (yellow), 12-20% = Balanced (green), >20% = Seller's Market (red)
  tip: string;
}
