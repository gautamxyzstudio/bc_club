import axios from "axios";
import { Endpoints } from "../endpoints";
import Cookies from "js-cookie";
import { hasAdminRole } from "@/src/utilities/authUtils";

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
 * Helper to get current user from cookie or localStorage
 */
export const getStoredAuthUser = (): any => {
  try {
    const userCookie = Cookies.get("username");
    if (userCookie) {
      return typeof userCookie === "string"
        ? JSON.parse(userCookie)
        : userCookie;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) return JSON.parse(stored);
    }
  } catch {
    // ignore parse error
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

export interface LogActivityPayload {
  propertySearchType:
    | "find_home"
    | "property_evaluation"
    | "evaluation"
    | "home_assessment";
  searchTerm?: string;
  propertyId?: string | number;
  realEstateBoardId?: string | number;
  propertyAssignmentListId?: string | number;
  userId?: string | number;
  userDocumentId?: string;
}

export interface ActivityLogItem {
  id: number;
  documentId: string;
  propertySearchType: "find_home" | "property_evaluation";
  searchTerm: string;
  createdAt: string;
  updatedAt: string;
  users_permissions_user?: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
  };
  real_estate_board?: {
    id: number;
    documentId: string;
    listing_id?: string;
    address?: string;
    city?: string;
    price?: number;
    bedrooms?: number;
    bathrooms?: number;
    media_url?: any[];
    media?: any[];
  };
  property_assignment_list?: {
    id: number;
    documentId: string;
    roll?: string;
    address?: string;
    totalValue?: string;
    landValue?: string;
    buildingValue?: string;
    image?: string;
  };
}

const recentLogsMap = new Map<string, number>();

/**
 * Logs a property search or detail view event (Only for users with role Admin)
 */
export async function logPropertySearchActivity(
  payload: LogActivityPayload,
): Promise<any> {
  try {
    const currentUser = getStoredAuthUser();
    const token = getAuthToken();

    // Activity logs are ONLY created for users whose role is Admin
    if (!currentUser || !hasAdminRole(currentUser)) {
      return null;
    }

    const userId =
      payload.userId || currentUser?.id || currentUser?.documentId || "auth";
    const propKey =
      payload.propertyId ||
      payload.realEstateBoardId ||
      payload.propertyAssignmentListId ||
      payload.searchTerm ||
      "";
    const dedupKey = `${userId}_${payload.propertySearchType}_${propKey}`;
    const now = Date.now();
    const lastLogged = recentLogsMap.get(dedupKey);

    // If logged within the last 10 seconds, skip duplicate call
    if (lastLogged && now - lastLogged < 10000) {
      return null;
    }
    recentLogsMap.set(dedupKey, now);

    // Clean up older cache keys
    if (recentLogsMap.size > 100) {
      for (const [k, time] of recentLogsMap.entries()) {
        if (now - time > 60000) {
          recentLogsMap.delete(k);
        }
      }
    }

    const body: LogActivityPayload = {
      ...payload,
      userId: payload.userId || currentUser?.id,
      userDocumentId: payload.userDocumentId || currentUser?.documentId,
    };

    const authHeaders = getAuthHeaders();
    const res = await axios.post(Endpoints.logActivity, body, {
      ...authHeaders,
    });
    return res.data;
  } catch (error) {
    // Non-blocking log failure
    console.warn("Failed to record activity log:", error);
    return null;
  }
}

/**
 * Fetch activity logs for a specific user
 */
export async function getUserActivityLogs(
  userId: string | number,
): Promise<ActivityLogItem[]> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getUserActivityLogs(userId), {
      ...authHeaders,
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Failed to fetch user activity logs:", error);
    return [];
  }
}

/**
 * Fetch all activity logs with params
 */
export async function getActivityLogs(
  params?: any,
): Promise<ActivityLogItem[]> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getActivityLogs, {
      ...authHeaders,
      params: {
        populate: "*",
        sort: "createdAt:desc",
        ...params,
      },
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return [];
  }
}
