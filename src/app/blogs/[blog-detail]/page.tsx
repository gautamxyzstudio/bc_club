
import { getBlogBySlug, getBlogImageUrl } from "@/src/api/blogs/blogsApi";
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
    openGraph: {
    title: blogData?.data?.metaTitle,
    description:blogData?.data?.metaDescription,
    images: [
      {
        url: getBlogImageUrl(blogData?.data?.blogImage),
        width: 1144,
        height: 636,
        alt: blogData?.data?.metaTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: blogData?.data?.metaTitle,
    description:blogData?.data?.metaDescription,
    images: [getBlogImageUrl(blogData?.data?.blogImage)],
  },
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
 