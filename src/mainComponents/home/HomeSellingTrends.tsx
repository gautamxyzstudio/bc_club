"use client";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { useState } from "react";
import { cities } from ".";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";
import SalesReportedRecharts from "@/src/components/charts/SalesReportedRecharts";
import MedianAverageDaysRecharts from "@/src/components/charts/MedianAverageDaysRecharts";
import MedianAveragePriceRecharts from "@/src/components/charts/MedianAveragePriceRecharts";
import { useAuthContext } from "../auth/AuthContext";
import { useGetBridgeCities } from "@/src/hooks/listing/useRealEstateListingQueries";

const HomeSellingTrends = () => {
  const { data: bridgeCitiesRes } = useGetBridgeCities();
  const citiesList: string[] =
    bridgeCitiesRes?.data && bridgeCitiesRes.data.length > 0
      ? bridgeCitiesRes.data
      : cities;

  const [location, setLocation] = useState<string>("Surrey");
  const { isLoggedIn } = useAuthContext();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setLocation(event.target.value);
  };

  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-13 px-6 bg-gray md:py-20 py-8">
      {/* Header */}
      <div className="flex flex-col gap-y-3">
        <Description type={IDescriptionTypes.dec16} content="Selling Trends" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <Heading
            tagType="h2"
            type={IHeadingTypes.heading48}
            content="Number of Sales Reported"
            customClasses="font-bold "
          />
          {/* Location Selector */}
          {isLoggedIn && (
            <Select
              value={location}
              onChange={handleChange}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      maxHeight: 260,
                    },
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                variant: "menu",
                disableAutoFocusItem: true,
                autoFocus: false,
              }}
              sx={{
                borderRadius: 3,
                width: 180,
                "& .MuiOutlinedInput-notchedOutline , & .Mui-focused.MuiOutlinedInput-notchedOutline":
                  {
                    borderWidth: "0 !important",
                  },
              }}
              className="shadow-[0_0_20px_0_rgba(0,0,0,0.12)]"
            >
              {citiesList.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          )}
        </div>
      </div>

      <SalesReportedRecharts location={location} />

      <div className="flex lg:flex-row flex-col gap-6 items-center justify-between mt-6">
        <MedianAverageDaysRecharts />
        <MedianAveragePriceRecharts />
      </div>
    </section>
  );
};

export default HomeSellingTrends;
