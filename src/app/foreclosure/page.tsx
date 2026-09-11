import React from "react";
import ForeclosureListingPage from "@/src/mainComponents/foreclosure/ForeclosureListingPage";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foreclosure Properties | Bank Owned & Distressed Real Estate BC",
  description:
    "Explore the latest bank-owned and foreclosure properties across British Columbia. Search exclusive deals, distress sales, and court-ordered listings.",
};

export default function ForeclosurePage() {
  return (
    <>
      <ForeclosureListingPage />
      <GetInTouch />
    </>
  );
}
