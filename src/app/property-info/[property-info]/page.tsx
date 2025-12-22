import { propertyData, propertyImages } from "@/src/mainComponents/dummyData";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import PropertyGallery from "@/src/mainComponents/propertyInfo/PropertyGallery";
import PropertyInformation from "@/src/mainComponents/propertyInfo/propertyInformation/PropertyInformation";
import PropertyTopAddressSection from "@/src/mainComponents/propertyInfo/PropertyTopAddressSection";
import React from "react";

interface Params {
  "property-info": string;
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["property-info"];
  const data = propertyData.find((list) => list.id === paramsId);
  return (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full bg-background flex flex-col xl:px-16 md:px-13 px-6 xl:pt-35.5 xl:pb-28.25 md:pt-28 md:pb-25 pt-21 pb-13 ">
        <PropertyTopAddressSection property={data} />
        <PropertyGallery images={propertyImages} />
        <PropertyInformation property={data} />
      </section>
      <GetInTouch />
    </>
  );
};

export default page;
