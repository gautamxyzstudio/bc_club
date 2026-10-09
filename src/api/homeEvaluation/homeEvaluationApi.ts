import axios from "axios";
import Cookies from "js-cookie";
import { Endpoints } from "../endpoints";

export const getAuthToken = (): string | null => {
  const cookieToken = Cookies.get("token");
  if (cookieToken) return cookieToken;
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || null;
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
};

export interface HomeEvaluationPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  propertySizeInSquareFeet: string;
}

export interface HomeEvaluationRequestItem {
  id: number | string;
  documentId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  propertySizeInSquareFeet: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  [key: string]: any;
}

/**
 * Normalizes raw Strapi response items to flat HomeEvaluationRequestItem objects.
 */
export function normalizeHomeEvaluationItem(item: any): HomeEvaluationRequestItem {
  if (!item) {
    return {
      id: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      propertySizeInSquareFeet: "",
      createdAt: "",
    };
  }

  const attrs = item.attributes || item;
  return {
    id: item.id || attrs.id || item.documentId || attrs.documentId || "",
    documentId: item.documentId || attrs.documentId || item.id?.toString(),
    fullName: attrs.fullName || attrs.name || "",
    email: attrs.email || "",
    phoneNumber: attrs.phoneNumber || attrs.phone || "",
    address: attrs.address || "",
    propertySizeInSquareFeet: attrs.propertySizeInSquareFeet || attrs.propertySize || "",
    createdAt: attrs.createdAt || item.createdAt || new Date().toISOString(),
    updatedAt: attrs.updatedAt || item.updatedAt,
    publishedAt: attrs.publishedAt || item.publishedAt,
    ...attrs,
  };
}

/**
 * Submit a new Home Evaluation Request from the client side form
 */
export async function submitHomeEvaluationRequest(
  payload: HomeEvaluationPayload,
): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await axios.post(
      Endpoints.createHomeEvaluationRequest,
      {
        data: payload,
      },
      { headers },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to submit evaluation request",
      );
    }
    throw new Error(error?.message || "An unexpected error occurred");
  }
}

/**
 * Fetch all Home Evaluation Requests for admin with optional params
 */
export async function getHomeEvaluationRequests(
  params?: any,
): Promise<HomeEvaluationRequestItem[]> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getHomeEvaluationRequests, {
      ...authHeaders,
      params: {
        sort: "createdAt:desc",
        populate: "*",
        "pagination[pageSize]": 100,
        ...params,
      },
    });

    const data = res.data;
    let rawList: any[] = [];

    if (Array.isArray(data)) {
      rawList = data;
    } else if (Array.isArray(data?.data)) {
      rawList = data.data;
    } else if (Array.isArray(data?.results)) {
      rawList = data.results;
    }

    return rawList.map(normalizeHomeEvaluationItem);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const strapiMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message;

      if (status === 403) {
        throw new Error(strapiMsg || "Forbidden");
      }
      if (status === 401) {
        throw new Error(strapiMsg || "Unauthorized");
      }
      if (status === 404) {
        throw new Error(strapiMsg || "Not Found");
      }
      throw new Error(
        strapiMsg ||
          error.message ||
          "Failed to fetch evaluation requests",
      );
    }
    throw error;
  }
}

/**
 * Fetch single Home Evaluation Request by ID or documentId
 */
export async function getHomeEvaluationRequestById(
  id: string | number,
): Promise<HomeEvaluationRequestItem> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getHomeEvaluationRequestById(id), {
      ...authHeaders,
      params: {
        populate: "*",
      },
    });

    const data = res.data;
    const raw = data?.data || data;
    return normalizeHomeEvaluationItem(raw);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch evaluation request details",
      );
    }
    throw error;
  }
}

/**
 * Delete a Home Evaluation Request by ID or documentId
 */
export async function deleteHomeEvaluationRequest(
  id: string | number,
): Promise<boolean> {
  try {
    const authHeaders = getAuthHeaders();
    const targetIdentifier = id;
    await axios.delete(
      Endpoints.deleteHomeEvaluationRequest(targetIdentifier),
      authHeaders,
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete evaluation request",
      );
    }
    throw error;
  }
}
