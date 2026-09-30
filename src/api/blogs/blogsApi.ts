import axios from "axios";
import { Endpoints } from "../endpoints";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Helper to get user auth token from cookie or localStorage
 */
export const getAuthToken = (): string | null => {
  const cookieToken = Cookies.get("token");
  if (cookieToken) return cookieToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || null;
  }
  return null;
};

/**
 * Helper to get clean image URL from Strapi media object / string
 */
export const getBlogImageUrl = (image: any): string => {
  if (!image) return "/blogimg.webp";
  if (typeof image === "string") {
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }
    return image.startsWith("/")
      ? `${BASE_URL}${image}`
      : `${BASE_URL}/${image}`;
  }

  // Handle Strapi media object shapes
  const url =
    image.url ||
    image.data?.attributes?.url ||
    image.attributes?.url ||
    image.formats?.medium?.url ||
    image.formats?.small?.url ||
    image.formats?.thumbnail?.url;

  if (url) {
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
  }

  return "/blogimg.webp";
};

/**
 * Helper to decode HTML entities like &lt;, &gt;, &quot;, &#39;, &amp;
 */
export function decodeHtmlEntities(html: string): string {
  if (!html) return "";
  let decoded = html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

  let prev = "";
  while (
    decoded !== prev &&
    (decoded.includes("&lt;") ||
      decoded.includes("&gt;") ||
      decoded.includes("&amp;"))
  ) {
    prev = decoded;
    decoded = decoded
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
  }

  return decoded;
}

/**
 * Fetch all blogs with optional filtering/sorting/pagination
 */
export async function getBlogs(params?: any): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getBlogs, {
      params: {
        populate: "*",
        ...params,
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch blogs",
      );
    }
    throw new Error("An unexpected error occurred while fetching blogs");
  }
}

/**
 * Fetch single blog by slug
 */
export async function getBlogBySlug(slug: string): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getBlogBySlug(slug), {
      params: {
        populate: "*",
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          `Failed to fetch blog with slug "${slug}"`,
      );
    }
    throw new Error("An unexpected error occurred while fetching blog");
  }
}

/**
 * Create a new blog post
 */
export async function createBlog(blogData: any): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.post(
      Endpoints.createBlog,
      { data: blogData },
      { headers },
    );
    return res.data;
  } catch (error) {
    try {
      const fallbackRes = await axios.post(Endpoints.createBlog, blogData, {
        headers,
      });
      return fallbackRes.data;
    } catch {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message ||
            error.response?.data?.message ||
            "Failed to create blog",
        );
      }
      throw new Error("An unexpected error occurred while creating blog");
    }
  }
}

/**
 * Update an existing blog by slug
 */
export async function updateBlog(slug: string, blogData: any): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.put(
      Endpoints.updateBlogBySlug(slug),
      { data: blogData },
      { headers },
    );
    return res.data;
  } catch (error) {
    try {
      const fallbackRes = await axios.put(
        Endpoints.updateBlogBySlug(slug),
        blogData,
        { headers },
      );
      return fallbackRes.data;
    } catch {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message ||
            error.response?.data?.message ||
            `Failed to update blog "${slug}"`,
        );
      }
      throw new Error("An unexpected error occurred while updating blog");
    }
  }
}

/**
 * Delete a blog post by slug
 */
export async function deleteBlog(slug: string): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.delete(Endpoints.deleteBlogBySlug(slug), {
      headers,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          `Failed to delete blog "${slug}"`,
      );
    }
    throw new Error("An unexpected error occurred while deleting blog");
  }
}

/**
 * Upload an image/file to Strapi media library
 */
export async function uploadBlogMedia(file: File): Promise<any> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("files", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.post(Endpoints.uploadMedia, formData, {
      headers,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to upload image",
      );
    }
    throw new Error("An unexpected error occurred while uploading image");
  }
}
