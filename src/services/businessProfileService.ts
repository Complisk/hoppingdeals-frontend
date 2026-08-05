"use client";
import axios from "axios";
import { extractErrorMessage } from "@/utils/errorHandler";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const buildAuthHeaders = () => {
  const token = localStorage.getItem("businessToken");
  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-timezone": browserTimezone,
  };
};

export const useBusinessProfileService = () => {
  const getProfile = async () => {
    try {
      const response = await axios.get(`${baseUrl}/business/profile`, {
        headers: buildAuthHeaders(),
        withCredentials: true,
      });

      return {
        response: response.data?.business || response.data,
        error: null,
      };
    } catch (error) {
      return { response: null, error: extractErrorMessage(error) };
    }
  };

  const updateProfile = async (payload: FormData) => {
    try {
      const response = await axios.put(`${baseUrl}/business/profile`, payload, {
        headers: {
          ...buildAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      return {
        response: response.data?.business || response.data,
        error: null,
      };
    } catch (error) {
      return { response: null, error: extractErrorMessage(error) };
    }
  };

  return { getProfile, updateProfile };
};

export default useBusinessProfileService;
