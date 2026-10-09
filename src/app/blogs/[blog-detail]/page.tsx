
import { getBlogBySlug } from "@/src/api/blogs/blogsApi";
import BlogDetailPage from "@/src/mainComponents/blog/BlogDetailPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "blog-detail": string }>;
}) {
  const { "blog-detail": slug } = await params;
  const blogData = await getBlogBySlug(slug);
  return {
    title: blogData?.data?.metaTitle || blogData?.data?.title || "Blog",
    description: blogData?.data?.metaDescription || "",
  };
}

const page = async ({
  params,
}: {
  params: Promise<{ "blog-detail": string }>;
}) => {
  const { "blog-detail": slug } = await params;
  return <BlogDetailPage slug={slug} />;
};

export default page;
 