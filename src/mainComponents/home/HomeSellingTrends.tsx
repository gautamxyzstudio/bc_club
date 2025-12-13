'use client'
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { MenuItem, Select } from "@mui/material";
import React, { useState } from "react";
import { cities } from ".";
import Description, {
  IDescriptionTypes,
} from "@/src/components/description/Description";

const HomeSellingTrends = () => {
  const [location, setLocation] = useState<string>("Surrey, BC");

  const handleChange = (event: { target: { value: string } }) => {
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
          <Select
            value={location}
            onChange={handleChange}
            sx={{
              borderRadius: 10,
              "& .MuiOutlinedInput-notchedOutline , & .Mui-focused.MuiOutlinedInput-notchedOutline":
                {
                  borderWidth: "0 !important",
                },
            }}
            className="shadow-[0_0_20px_0_rgba(0,0,0,0.12)]"
          >
            {cities.map((city, idx) => (
              <MenuItem key={idx} value={city}>
                {city}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
    </section>
  );
};

export default HomeSellingTrends;
