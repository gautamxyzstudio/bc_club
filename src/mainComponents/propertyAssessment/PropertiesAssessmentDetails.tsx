"use client";
import React, { useEffect, useRef } from "react";
import { useGetPropertiesAssignmentDetails } from "@/src/hooks/listing/useListingQueries";
import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import AssessmentPropertySimilarAndSoldListing from "@/src/mainComponents/propertyAssessment/AssessmentPropertySimilarAndSoldListing";
import PropertyAssessmentInformation from "@/src/mainComponents/propertyAssessment/PropertyAssessmentInformation";
import PropertyAssessmentTopSection from "@/src/mainComponents/propertyAssessment/PropertyAssessmentTopSection";
import { logPropertySearchActivity } from "@/src/api/activityLog/activityLogApi";

const PropertiesAssessmentDetails = ({
  assessmentId,
}: {
  assessmentId: string;
}) => {
  const { data } = useGetPropertiesAssignmentDetails(assessmentId);
  const property = data;

  const hasLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (property && (property.documentId || assessmentId)) {
      const targetId = property.documentId || assessmentId;
      if (hasLoggedRef.current !== targetId) {
        hasLoggedRef.current = targetId;
        logPropertySearchActivity({
          propertySearchType: "property_evaluation",
          searchTerm: property.address || "",
          propertyId: targetId,
        });
      }
    }
  }, [property, assessmentId]);

  return (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full flex flex-col xl:gap-y-13 md:gap-y-10 gap-y-7 xl:px-16 md:px-13 px-6 xl:pt-35.5 xl:pb-38 md:pt-28 md:pb-31 pt-21 pb-13 ">
        <PropertyAssessmentTopSection data={property} />
        <PropertyAssessmentInformation data={property} />
      </section>
      <AssessmentPropertySimilarAndSoldListing
        propertyId={property?.documentId}
      />

      <GetInTouch />
    </>
  );
};

export default PropertiesAssessmentDetails;
