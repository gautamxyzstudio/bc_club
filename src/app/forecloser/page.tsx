import React from "react";
import ForeclosureListingPage from "@/src/mainComponents/foreclosure/ForeclosureListingPage";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forecloser Properties | BC Real Estate",
  description: "Browse forecloser properties list.",
};

export default function ForecloserPage() {
  return (
    <>
      <ForeclosureListingPage />
      <GetInTouch />
    </>
  );
}
