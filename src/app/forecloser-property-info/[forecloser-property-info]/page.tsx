
import { getForecloserListingById } from "@/src/api/listing/realEstateListing";
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
  const propertyData = await getForecloserListingById(slug);
  return {
    title: `${propertyData?.data?.address} | BC Real Estate` || "Property For Sale",
    description: propertyData?.data?.public_remarks.slice(0, 150) || propertyData?.data?.private_remarks.slice(0, 150) || "",
    openGraph: {
    title: propertyData?.data?.address || "Property For Sale",
    description:propertyData?.data?.public_remarks.slice(0, 150) || propertyData?.data?.private_remarks.slice(0, 150) || "",
    images: [
      {
        url: propertyData?.data?.media_url?.[0] || "",
        width: 1144,
        height: 636,
        alt: propertyData?.data?.address,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: propertyData?.data?.address || "Property For Sale",
    description:propertyData?.data?.public_remarks.slice(0, 150) || propertyData?.data?.private_remarks.slice(0, 150) || "",
    images: [propertyData?.data?.media_url?.[0] || ""],
  },
  };
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["forecloser-property-info"];
  return (
    <PropertyInfo paramsId={paramsId} />
  );
};

export default page;
