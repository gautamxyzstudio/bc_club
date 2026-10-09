import GetInTouch from "@/src/mainComponents/getInTouch/GetInTouch";
import HomePropertiesSold from "@/src/mainComponents/home/HomePropertiesSold";
import DiscoverHomeValue from "@/src/mainComponents/homeEstimation/DiscoverHomeValue";
import HomeEstimationTop from "@/src/mainComponents/homeEstimation/HomeEstimationTop";
import HomeAssessmentSearchSection from "@/src/mainComponents/homeEstimation/HomeAssessmentSearchSection";

const page = () => {
  return (
    <>
      <HomeEstimationTop />
      {/* <DiscoverHomeValue /> */}
      <HomeAssessmentSearchSection />
      <HomePropertiesSold />
      <GetInTouch />
    </>
  );
};

export default page;
