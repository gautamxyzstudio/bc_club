import axios from "axios";
import { Endpoints } from "../endpoints";
import Cookies from "js-cookie";

export async function getListings(params?: any): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getRealEstatePropertiesList, {
      params,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function getListingById(id: string): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getRealEstatePropertiesListById(id));

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

// Real Estate Favorites
export async function addRealEstateFavorite(id: string): Promise<any> {
  const token = Cookies.get("token");
  const userCookie = Cookies.get("username");
  let userId = null;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      userId = user.id || user.documentId;
    } catch (e) {
      console.error("Error parsing user cookie", e);
    }
  }

  try {
    const res = await axios.post(
      Endpoints.addRealEstateFavorite(id),
      {
        DocumentID: id,
        userId: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function removeRealEstateFavorite(id: string): Promise<any> {
  const token = Cookies.get("token");
  try {
    const res = await axios.delete(Endpoints.removeRealEstateFavorite(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function getMyRealEstateFavorites(params?: any): Promise<any> {
  const token = Cookies.get("token");
  try {
    const res = await axios.get(Endpoints.getMyRealEstateFavorites, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

// Get nearby places
export async function getNearbyRealEstatePlaces(id: string): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getNearbyRealEstatePlaces(id));
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

// Similar Properties
export async function getSimilarRealEstateProperties(id: string): Promise<any> {
  try {
    const res = await axios.get(Endpoints.getSimilarRealEstateProperties(id));
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

// Similar Sold Properties
export async function getSimilarRealEstateSoldProperties(
  id: string,
): Promise<any> {
  try {
    const res = await axios.get(
      Endpoints.getSimilarRealEstateSoldProperties(id),
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function getRealEstatePropertiesListByAddress(params?: {
  address?: string;
}): Promise<any> {
  try {
    const res = await axios.post(
      Endpoints.getRealEstatePropertiesListByAddress,
      null,
      { params },
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error?.message || "API error");
    }
    throw new Error("An unexpected error occurred");
  }
}

export async function updateRealEstateListing(
  id: string,
  updatedData: any,
): Promise<any> {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await axios.put(
      Endpoints.updateRealEstateListing(id),
      { data: updatedData },
      { headers },
    );
    return res.data;
  } catch (error) {
    // If standard data wrapper fails with 400/500, attempt direct payload
    try {
      const resFallback = await axios.put(
        Endpoints.updateRealEstateListing(id),
        updatedData,
        { headers },
      );
      return resFallback.data;
    } catch (fallbackError) {
      if (axios.isAxiosError(fallbackError)) {
        throw new Error(
          fallbackError.response?.data?.error?.message ||
            fallbackError.response?.data?.message ||
            "Failed to update property",
        );
      }
      throw new Error("An unexpected error occurred while updating property");
    }
  }
}

// Get Forecloser Properties List
export async function getForecloserProperties(params?: any): Promise<any> {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.get(Endpoints.getForecloserProperties, {
      params,
      headers,
    });
    return res.data;
  } catch (error) {
    try {
      const fallbackUrl = Endpoints.getForecloserPropertiesAlt;
      const resFallback = await axios.get(fallbackUrl, { params, headers });
      return resFallback.data;
    } catch {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to fetch forecloser properties"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  }
}

// Copy Property To Forecloser List
export async function copyToForecloserList(docId: string): Promise<any> {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.post(
      Endpoints.copyToForecloserList(docId),
      {},
      { headers }
    );
    return res.data;
  } catch (error) {
    try {
      const fallbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/forecloser-properties/copy-from-real-estate/${docId}`;
      const resFallback = await axios.post(fallbackUrl, {}, { headers });
      return resFallback.data;
    } catch {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Failed to copy property to forecloser list"
        );
      }
      throw new Error("An unexpected error occurred while copying to forecloser list");
    }
  }
}

// Delete Property From Forecloser List
export async function deleteForecloserProperty(idOrDocId: string): Promise<any> {
  const token = Cookies.get("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await axios.delete(
      Endpoints.deleteForecloserProperty(idOrDocId),
      { headers }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        "Failed to remove property from foreclosure list"
      );
    }
    throw new Error("An unexpected error occurred while deleting foreclosure property");
  }
}
