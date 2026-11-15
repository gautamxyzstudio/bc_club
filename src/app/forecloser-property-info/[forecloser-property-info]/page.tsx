
import { listingMetadata } from "@/src/mainComponents/bcListing/seo/getListingSeo";
import ListingFaq from "@/src/mainComponents/bcListing/seo/ListingFaq";
import PropertyInfo from "@/src/mainComponents/propertyInfo/PropertyInfo";

interface Params {
  "forecloser-property-info": string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "forecloser-property-info": string }>;
}) {
  const { "forecloser-property-info": slug } = await params;
  return listingMetadata(slug, "fc");   // title, description and share card from this listing (seo/getListingSeo.ts)
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["forecloser-property-info"];
  return (
    <PropertyInfo paramsId={paramsId} seo={<ListingFaq id={paramsId} kind="fc" />} />
  );
};

export default page;
