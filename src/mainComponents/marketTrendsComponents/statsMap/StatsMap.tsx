"use client";

import React from "react";
import dynamic from "next/dynamic";

const StatsDetail = dynamic(() => import("./StatsDetail"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-155 lg:h-137.5 rounded-xl bg-gray-100 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#22558b] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const StatsMap = () => {
  return (
    <section className="w-full bg-white shadow relative max-w-screen-2xl mx-auto lg:mt-21 mt-16">
      <StatsDetail />
    </section>
  );
};

export default StatsMap;
