import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import HomePropertiesSold from "@/src/mainComponents/home/HomePropertiesSold";
import DiscoverHomeValue from "@/src/mainComponents/homeEstimation/DiscoverHomeValue";
import HomeEstimationTop from "@/src/mainComponents/homeEstimation/HomeEstimationTop";
import React from "react";

const page = () => {
  return (
    <>
      <HomeEstimationTop />
      <DiscoverHomeValue />
      <HomePropertiesSold />
      <GetInTouch />
    </>
  );
};

export default page;
