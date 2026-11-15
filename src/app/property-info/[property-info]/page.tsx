import { listingMetadata } from "@/src/mainComponents/bcListing/seo/getListingSeo";
import ListingFaq from "@/src/mainComponents/bcListing/seo/ListingFaq";
import BCListingPage from "@/src/mainComponents/bcListing/BCListingPage";

interface Params {
  "property-info": string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "property-info": string }>;
}) {
  const { "property-info": slug } = await params;
  return listingMetadata(slug, "sale");   // title, description and share card from this listing (seo/getListingSeo.ts)
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["property-info"];
  return (
    <BCListingPage key={paramsId} paramsId={paramsId} seo={<ListingFaq id={paramsId} kind="sale" />} />
  );
};

export default page;
