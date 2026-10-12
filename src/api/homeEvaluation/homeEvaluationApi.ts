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

export interface CallHistoryItem {
  id: number | string;
  documentId?: string;
  callAt: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  home_evaluation_request?: any;
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
  call_histories?: CallHistoryItem[];
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
      call_histories: [],
    };
  }

  const attrs = item.attributes || item;
  
  // Extract and normalize call_histories array
  const rawHistories =
    attrs.call_histories?.data ||
    attrs.call_histories ||
    item.call_histories?.data ||
    item.call_histories ||
    [];

  const normalizedCallHistories: CallHistoryItem[] = Array.isArray(rawHistories)
    ? rawHistories
        .map((h: any) => {
          const hAttrs = h.attributes || h;
          return {
            id: h.id || hAttrs.id || h.documentId || hAttrs.documentId || "",
            documentId: h.documentId || hAttrs.documentId || h.id?.toString(),
            callAt: hAttrs.callAt || h.callAt || hAttrs.createdAt || h.createdAt || "",
            createdAt: hAttrs.createdAt || h.createdAt,
            updatedAt: hAttrs.updatedAt || h.updatedAt,
            publishedAt: hAttrs.publishedAt || h.publishedAt,
          };
        })
        .sort(
          (a: CallHistoryItem, b: CallHistoryItem) =>
            new Date(b.callAt || b.createdAt || 0).getTime() -
            new Date(a.callAt || a.createdAt || 0).getTime(),
        )
    : [];

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
    call_histories: normalizedCallHistories,
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

export type DeleteHomeEvaluationPayload =
  | string
  | number
  | {
      id: string | number;
      callHistories?: CallHistoryItem[];
    };

/**
 * Delete a Home Evaluation Request by ID or documentId,
 * and cascade-delete all associated Call History records.
 */
export async function deleteHomeEvaluationRequest(
  payload: DeleteHomeEvaluationPayload,
): Promise<boolean> {
  try {
    const authHeaders = getAuthHeaders();
    const targetIdentifier =
      typeof payload === "object" ? payload.id : payload;
    const knownCallHistories =
      typeof payload === "object" ? payload.callHistories : undefined;

    const deletedCallIds = new Set<string>();

    // 1. Delete known call histories if provided from request state
    if (Array.isArray(knownCallHistories) && knownCallHistories.length > 0) {
      await Promise.allSettled(
        knownCallHistories.map(async (ch) => {
          const chId = ch.documentId || ch.id;
          if (chId) {
            deletedCallIds.add(String(chId));
            return deleteCallHistory(chId);
          }
        }),
      );
    }

    // 2. Query Strapi for any additional call histories linked to this evaluation request
    try {
      const res = await axios.get(
        `${Endpoints.getCallHistories}?filters[home_evaluation_request][documentId][$eq]=${targetIdentifier}&pagination[pageSize]=100`,
        authHeaders,
      );
      const items = res.data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        await Promise.allSettled(
          items.map(async (item: any) => {
            const chId = item.documentId || item.id;
            if (chId && !deletedCallIds.has(String(chId))) {
              deletedCallIds.add(String(chId));
              return deleteCallHistory(chId);
            }
          }),
        );
      }
    } catch {
      // Fallback: try by numeric ID filter
      try {
        const res = await axios.get(
          `${Endpoints.getCallHistories}?filters[home_evaluation_request][id][$eq]=${targetIdentifier}&pagination[pageSize]=100`,
          authHeaders,
        );
        const items = res.data?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          await Promise.allSettled(
            items.map(async (item: any) => {
              const chId = item.documentId || item.id;
              if (chId && !deletedCallIds.has(String(chId))) {
                deletedCallIds.add(String(chId));
                return deleteCallHistory(chId);
              }
            }),
          );
        }
      } catch {
        // Silently continue to parent request deletion
      }
    }

    // 3. Delete the parent Home Evaluation Request
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

/**
 * Create a Call History entry for a Home Evaluation Request
 */
export async function createCallHistory(payload: {
  callAt: string;
  home_evaluation_request: string | number;
}): Promise<CallHistoryItem> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.post(
      Endpoints.createCallHistory,
      {
        data: {
          callAt: payload.callAt,
          home_evaluation_request: payload.home_evaluation_request,
        },
      },
      authHeaders,
    );

    const raw = res.data?.data || res.data;
    const attrs = raw.attributes || raw;
    return {
      id: raw.id || attrs.id || raw.documentId || attrs.documentId || "",
      documentId: raw.documentId || attrs.documentId || raw.id?.toString(),
      callAt: attrs.callAt || raw.callAt || new Date().toISOString(),
      createdAt: attrs.createdAt || raw.createdAt,
      updatedAt: attrs.updatedAt || raw.updatedAt,
      publishedAt: attrs.publishedAt || raw.publishedAt,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to log call history",
      );
    }
    throw error;
  }
}

/**
 * Delete a Call History entry
 */
export async function deleteCallHistory(
  id: string | number,
): Promise<boolean> {
  try {
    const authHeaders = getAuthHeaders();
    await axios.delete(Endpoints.deleteCallHistory(id), authHeaders);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete call record",
      );
    }
    throw error;
  }
}
