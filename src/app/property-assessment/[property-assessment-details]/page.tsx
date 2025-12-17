import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import MapTapSection from "@/src/mainComponents/propertyAssessment/MapTapSection";
import PropertyAssessmentTopSection from "@/src/mainComponents/propertyAssessment/PropertyAssessmentTopSection";
import PropertyInformation from "@/src/mainComponents/propertyAssessment/PropertyInformation";
import RegisterWithBC from "@/src/mainComponents/propertyAssessment/RegisterWithBC";

interface Params {
  "property-assessment-details": string;
}

const Page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const assessmentId = resolvedParams["property-assessment-details"];
  return (
    <>
      <section className="xl:max-w-screen-2xl mx-auto w-full flex flex-col xl:gap-y-13 md:gap-y-10 gap-y-7 xl:px-16 md:px-13 px-6 xl:pt-35.5 xl:pb-38 md:pt-28 md:pb-31 pt-21 pb-13 ">
        <PropertyAssessmentTopSection data={assessmentId} />
        <PropertyInformation />
        <RegisterWithBC />
        <MapTapSection />
      </section>
      <GetInTouch />
    </>
  );
};

export default Page;
