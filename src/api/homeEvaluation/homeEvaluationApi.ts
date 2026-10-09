import axios from "axios";
import Cookies from "js-cookie";
import { Endpoints } from "../endpoints";

export interface HomeEvaluationPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  propertySizeInSquareFeet: string;
}

export async function submitHomeEvaluationRequest(
  payload: HomeEvaluationPayload,
): Promise<any> {
  const token = Cookies.get("token");
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
