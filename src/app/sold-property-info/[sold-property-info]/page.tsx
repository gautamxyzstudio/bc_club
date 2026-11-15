import { listingMetadata } from "@/src/mainComponents/bcListing/seo/getListingSeo";
import ListingFaq from "@/src/mainComponents/bcListing/seo/ListingFaq";
import SoldPropertyInfo from "@/src/mainComponents/soldPropertyInfo/SoldPropertyInfo";

interface Params {
  "sold-property-info": string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "sold-property-info": string }>;
}) {
  const { "sold-property-info": slug } = await params;
  return listingMetadata(slug, "sold");   // title, description and share card from this listing (seo/getListingSeo.ts)
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["sold-property-info"];
  return <SoldPropertyInfo paramsId={paramsId} seo={<ListingFaq id={paramsId} kind="sold" />} />;
};

export default page;
