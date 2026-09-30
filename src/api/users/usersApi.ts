import axios from "axios";
import { Endpoints } from "../endpoints";
import Cookies from "js-cookie";

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
 * Helper to create authorized axios headers
 */
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

export interface StrapiRole {
  id: number;
  documentId?: string;
  name: string;
  description?: string;
  type?: string;
}

export interface StrapiUser {
  id: number | string;
  documentId?: string;
  username: string;
  email: string;
  fullName?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  acceptedVowTerms?: boolean | null;
  acceptedVowAt?: string | null;
  acceptedVowVersion?: string | null;
  isVowRegistrant?: boolean | null;
  isVowActive?: boolean | null;
  vowActivatedAt?: string | null;
  vowExpiresAt?: string | null;
  lastVowPasswordResetAt?: string | null;
  role?: StrapiRole | string;
  [key: string]: any;
}

/**
 * Fetch all users with optional filtering/population
 */
export async function getUsers(params?: any): Promise<StrapiUser[]> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getUsers, {
      ...authHeaders,
      params: {
        populate: "*",
        ...params,
      },
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch users",
      );
    }
    throw error;
  }
}

/**
 * Fetch single user by ID or documentId
 */
export async function getUserById(id: string | number): Promise<StrapiUser> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getUserById(id), {
      ...authHeaders,
      params: {
        populate: "*",
      },
    });
    return res.data?.data || res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch user details",
      );
    }
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  data: Partial<StrapiUser> & { password?: string },
): Promise<StrapiUser> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.post(Endpoints.createUser, data, authHeaders);
    return res.data?.data || res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to create user",
      );
    }
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  id: string | number,
  data: Partial<StrapiUser>,
): Promise<StrapiUser> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.put(Endpoints.updateUser(id), data, authHeaders);
    return res.data?.data || res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to update user",
      );
    }
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string | number): Promise<any> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.delete(Endpoints.deleteUser(id), authHeaders);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to delete user",
      );
    }
    throw error;
  }
}

/**
 * Fetch available user roles
 */
export async function getUserRoles(): Promise<StrapiRole[]> {
  try {
    const authHeaders = getAuthHeaders();
    const res = await axios.get(Endpoints.getUserRoles, authHeaders);
    return res.data?.roles || res.data || [];
  } catch (error) {
    return [];
  }
}
