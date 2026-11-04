"use client";
import { cities } from ".";
import { useGetBridgeCities } from "@/src/hooks/listing/useRealEstateListingQueries";
import HomesSold from "./homes-sold/HomesSold";

/* Homepage "Selling trends" block — now renders the new "Homes sold" section.
   The previous chart (SalesReportedRecharts) is no longer used here. */
const HomeSellingTrends = () => {
  const { data: bridgeCitiesRes } = useGetBridgeCities();
  const citiesList: string[] =
    bridgeCitiesRes?.data && bridgeCitiesRes.data.length > 0
      ? bridgeCitiesRes.data
      : cities;

  return (
    <div className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-9 px-6 bg-gray md:py-20 py-8">
      <HomesSold cities={citiesList} defaultCity="Surrey" lagDays={3} />
    </div>
  );
};

export default HomeSellingTrends;
