"use client";
import axios from "axios";
import { toast } from "react-toastify";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const fetchData = async (
  url = "",
  options: any = {},
  callBack: any = () => {},
  role: any = null,
) => {
  let response = null;
  let error = null;
  const token =
    role == "admin"
      ? localStorage.getItem("adminToken")
      : role == "user"
        ? localStorage.getItem("userToken")
        : role == "business"
          ? localStorage.getItem("businessToken")
          : localStorage.getItem("userToken");
  const browserTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  try {
    const config = {
      url: baseUrl + url,
      ...options,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "x-timezone": browserTimezone,
        ...options?.headers,
      },
    };

    // Add token to Authorization header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const res = await axios(config);
    response = res.data;

    if (callBack) {
      callBack(response, true);
    }
  } catch (err) {
    error = err.response?.data || err.message;

    if (callBack) {
      callBack(err.response?.data, false);
    }

    // // Handle "User not found" - redirect to login
    // if (
    //   err.response?.data?.message === "User not found" ||
    //   err.response?.status === 401
    // ) {
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("userToken");
    //   localStorage.removeItem("businessToken");
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("business");
    //   window.location.href = "/login";
    //   return { response, error };
    // }

    // Handle permission denied (403)
    if (err.response?.status === 403) {
      const message =
        err.response?.data?.message ||
        "You don't have permission to perform this action";
      toast.error(message);
      return { response, error };
    }

    // Show error toast
    // if (err.response?.data?.message) {
    //   toast.error(err.response.data.message);
    // } else if (err.message) {
    //   toast.error(err.message);
    // }
  }

  return { response, error };
};

export default fetchData;
