
import PropertyInfo from "@/src/mainComponents/propertyInfo/PropertyInfo";

interface Params {
  "forecloser-property-info": string;
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const resolvedParams = await params;
  const paramsId = resolvedParams["forecloser-property-info"];
  return (
    <PropertyInfo paramsId={paramsId} />
  );
};

export default page;
