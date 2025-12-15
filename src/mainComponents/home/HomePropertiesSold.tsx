"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Heading, { IHeadingTypes } from "@/src/components/heading/Heading";
import { MenuItem, Select } from "@mui/material";
import { cities, propertyDataByCity } from ".";

// Dynamically import FusionCharts component with SSR disabled
const GaugeChartComponent = dynamic<{ value: number; label: string }>(
  () => import("@/src/components/charts/GaugeChart"),
  { ssr: false }
);

const HomePropertiesSold = () => {
  const [location, setLocation] = useState<string>("Surrey, BC");

  const handleChange = (event: { target: { value: string } }) => {
    setLocation(event.target.value);
  };

  const propertyData = propertyDataByCity[location];

  const GaugeChart = ({
    value,
    label,
    tip,
  }: {
    value: number;
    label: string;
    tip: string;
  }) => {
    return (
      <div className="w-full bg-gray rounded-xl p-4">
        <h3 className="text-lg font-bold text-foreground">Market Demand</h3>
        <div className="relative w-full flex items-center justify-center min-h-50">
          <GaugeChartComponent value={value} label={label} />
        </div>
        <div className="flex items-center justify-center gap-1.5 -mt-8">
          <span className="text-base font-semibold text-foreground">
            {label}
          </span>
          <div className="tooltip tooltip-bottom" data-tip={tip}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12ZM12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12C20 9.87827 19.1571 7.84344 17.6569 6.34315C16.1566 4.84285 14.1217 4 12 4C9.87827 4 7.84344 4.84285 6.34315 6.34315C4.84285 7.84344 4 9.87827 4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20Z"
                fill="#305487"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 11C12.2652 11 12.5196 11.1054 12.7071 11.2929C12.8946 11.4804 13 11.7348 13 12V16C13 16.2652 12.8946 16.5196 12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071C11.1054 16.5196 11 16.2652 11 16V12C11 11.7348 11.1054 11.4804 11.2929 11.2929C11.4804 11.1054 11.7348 11 12 11Z"
                fill="#305487"
              />
              <path
                d="M13 9C13 9.26522 12.8946 9.51957 12.7071 9.70711C12.5196 9.89464 12.2652 10 12 10C11.7348 10 11.4804 9.89464 11.2929 9.70711C11.1054 9.51957 11 9.26522 11 9C11 8.73478 11.1054 8.48043 11.2929 8.29289C11.4804 8.10536 11.7348 8 12 8C12.2652 8 12.5196 8.10536 12.7071 8.29289C12.8946 8.48043 13 8.73478 13 9Z"
                fill="#305487"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="xl:max-w-screen-2xl mx-auto w-full xl:px-16 md:px-13 px-6 xl:py-35 md:py-31 py-14 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <Heading
          tagType="h2"
          type={IHeadingTypes.heading48}
          content="Properties Sold in Previous Month"
          customClasses="font-bold md:text-start text-center"
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

      {/* Property Cards */}
      <div className="w-full flex flex-row flex-wrap justify-between gap-y-6">
        {propertyData.map((property, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-[0_0_20px_0_rgba(0,0,0,0.12)] p-6 flex flex-col gap-6 w-full md:w-[47%] xl:w-[32%]"
          >
            {/* Sales Statistics */}
            <div className="flex flex-col items-center text-center">
              <h3 className="text-lg font-bold text-foreground mb-3">
                {property.type}
              </h3>
              <div className="text-5xl font-bold text-primary mb-2">
                {property.sold}+
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <rect
                    width="20"
                    height="20"
                    rx="2"
                    className={`${
                      property.changePercent >= 0
                        ? "fill-lightGreen"
                        : "fill-lightRed"
                    }`}
                  />
                  {property.changePercent >= 0 ? (
                    <path
                      d="M15 7.5L12.3535 10.1465C12.2597 10.2402 12.1326 10.2929 12 10.2929C11.8674 10.2929 11.7403 10.2402 11.6465 10.1465L10.8535 9.3535C10.7597 9.25976 10.6326 9.20711 10.5 9.20711C10.3674 9.20711 10.2403 9.25976 10.1465 9.3535L8 11.5"
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      className="stroke-green"
                    />
                  ) : (
                    <path
                      d="M15.8319 11.2963L12.4012 7.86562C12.2797 7.74411 12.1149 7.67585 11.943 7.67585C11.7711 7.67585 11.6063 7.74411 11.4848 7.86562L10.4568 8.89358C10.3352 9.01509 10.1704 9.08335 9.99855 9.08335C9.82669 9.08335 9.66186 9.01509 9.54031 8.89358L6.75781 6.11108"
                      className="stroke-red"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  <path
                    d="M4.16406 4.16663V13.7592C4.16406 14.4851 4.16406 14.8481 4.30536 15.1255C4.42964 15.3694 4.62794 15.5677 4.87184 15.692C5.14925 15.8333 5.51221 15.8333 6.23814 15.8333H15.8307"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className={`${
                      property.changePercent >= 0
                        ? "stroke-green"
                        : "stroke-red"
                    }`}
                  />
                </svg>
                <span
                  className={`text-sm font-medium ${
                    property.changePercent > 0 ? "text-green" : "text-red"
                  }`}
                >
                  {Math.abs(property.changePercent)}%
                </span>
                <span className="text-sm text-lightWhite">Last Year 2025</span>
              </div>
            </div>

            {/* Market Demand Gauge */}
            <GaugeChart
              value={property.gaugeValue}
              label={property.marketCondition}
              tip={property.tip}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePropertiesSold;
