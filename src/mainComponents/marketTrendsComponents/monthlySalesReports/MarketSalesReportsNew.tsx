"use client";

import React from "react";
import VisualMarketReport from "./VisualMarketReport";

interface MarketSalesReportsNewProps {
  onSwitchToTableView?: () => void;
  initialRegion?: string;
  initialPropertyType?: string;
  initialYear?: number;
  initialMonth?: number;
}

const MarketSalesReportsNew: React.FC<MarketSalesReportsNewProps> = (props) => {
  return <VisualMarketReport {...props} />;
};

export default MarketSalesReportsNew;
