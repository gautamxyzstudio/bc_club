/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MarketSummaryItem {
  sold: number;
  pctOverAsk: number;
  medianPrice: number;
  soldToAsk: number;
  soldToAssess: number;
  pricePerSqft: number;
  dom: number;
  newListings: number;
  inventory: number;
}

export interface MarketSummary {
  lastYear?: MarketSummaryItem;
  thisYear: MarketSummaryItem;
}

export interface PriceRange {
  min: number;
  max: number | null;
  sold: number;
  inventory: number;
  new?: number;
}

export interface BedroomsData {
  label: string;
  beds: string;
  sold: number;
  inventory: number;
  new?: number;
}

export interface Neighbourhood {
  name: string;
  slug?: string;
  aliases?: string[];
  sold: number;
  inventory: number;
  new?: number;
}

export interface MarketTypeLink {
  label: string;
  propertyType: string;
  url: string;
}

export interface MarketReportData {
  region: string;
  areaShort: string;
  aliases?: string[];
  propertyType: string;
  month: string;
  updated?: string;
  source?: string;
  pageUrl?: string;
  types?: MarketTypeLink[];
  links?: {
    sold?: string;
    forSale?: string;
    [key: string]: any;
  };
  settings?: {
    minInventoryForPicks?: number;
    minSoldForHot?: number;
    minSoldForPicks?: number;
    showNeighbourhoods?: number;
    groupPricesFrom?: number | null;
    [key: string]: any;
  };
  summary: MarketSummary;
  priceRanges?: PriceRange[];
  bedrooms?: BedroomsData[];
  neighbourhoods?: Neighbourhood[];
  [key: string]: any;
}

export interface MarketGaugeInfo {
  soldPer100: number;
  label: string;
  marketType: "buyer" | "balanced" | "seller";
  buyerThreshold?: number;
  sellerThreshold?: number;
}

export interface MetricCardInfo {
  label: string;
  value: string | number;
  raw?: number;
  diffPercent?: number;
  direction?: "up" | "down" | "flat";
  previousValue?: string | number;
  subtext?: string;
}

export interface ContextCardInfo {
  label?: string;
  title?: string;
  name?: string;
  forSale: number;
  sold: number;
  ratio: number;
  badge: string;
  marketType: "buyer" | "balanced" | "seller";
  text: string;
  min?: number;
  max?: number | null;
}

export interface ListingComparisonInfo {
  text: string;
  diffPercent?: number;
  isBelow?: boolean;
  isAbove?: boolean;
  propertyPrice?: number;
  medianPrice?: number;
  formattedMedian?: string;
}

/**
 * Pre-formatted market snapshot data returned directly from Strapi backend (listing.marketReport)
 */
export interface FormattedMarketReport {
  snapshot?: {
    badge: string;
    marketType: "buyer" | "balanced" | "seller";
    monthLabel: string;
    eyebrow: string;
    title: string;
    area: string;
    propertyType: string;
    narrative: string;
    gauge: MarketGaugeInfo;
  };
  metrics?: {
    medianPrice: MetricCardInfo;
    daysToSell: MetricCardInfo;
    pricePaidVsAsking: MetricCardInfo;
    soldOverAsking: MetricCardInfo;
  };
  neighbourhood?: ContextCardInfo | null;
  priceBracket?: ContextCardInfo | null;
  listingComparison?: ListingComparisonInfo | null;
  cta?: {
    text: string;
    url: string;
  } | null;
  footer?: {
    source: string;
  } | null;
  // Direct shortcuts from backend
  badge?: string;
  marketType?: "buyer" | "balanced" | "seller";
  title?: string;
  eyebrow?: string;
  narrative?: string;
  gauge?: MarketGaugeInfo;
  medianPrice?: MetricCardInfo;
  daysToSell?: MetricCardInfo;
  pricePaidVsAsking?: MetricCardInfo;
  soldOverAsking?: MetricCardInfo;
  [key: string]: any;
}

export interface MarketWidgetProps {
  /** Pre-formatted marketReport object directly from listing.marketReport */
  marketReport?: FormattedMarketReport | null;
  /** Alias for marketReport or raw MarketReportData */
  data?: FormattedMarketReport | MarketReportData | null;
  /** Whole property listing object (will extract property.marketReport automatically) */
  property?: any;
  /** Listing city / area, e.g. "Surrey", "Vancouver" */
  area?: string;
  /** Listing property type, e.g. "House/Single Family", "Townhouse", "Apartment/Condo" */
  propertyType?: string;
  /** Sub-area / subdivision name, e.g. "Clayton", "Kitsilano" */
  neighbourhood?: string;
  /** Listing asking / list price, e.g. 1199000 */
  price?: number | string;
  /** Optional custom data URL template, e.g. 'https://api.example.com/market/{area}/{type}' */
  dataSrc?: string;
  /** Optional initial or preloaded data to avoid network fetch */
  initialData?: MarketReportData | FormattedMarketReport | null;
  /** Optional fallback flag */
  fallbackToSample?: boolean;
  /** Maximum age in months before hiding data in production (default: 12) */
  maxAgeMonths?: number;
  /** Additional container CSS class names */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Callback fired when widget visibility changes */
  onStateChange?: (shown: boolean) => void;
}
