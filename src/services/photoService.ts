"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface PhotoItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  altText?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhotoFormValues {
  title: string;
  description: string;
  altText: string;
  isActive: boolean;
  sortOrder: number;
  image?: File | null;
}

const getAdminToken = () => localStorage.getItem("adminToken");

const readJsonSafe = async <T,>(res: Response): Promise<T | null> => {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

export const photoService = {
  async getPublicPhotos(): Promise<PhotoItem[]> {
    const { response, error } = await fetchData("/photos", { method: "GET" });

    if (error) {
      throw new Error(extractErrorMessage(error));
    }

    return response?.photos || [];
  },

  async getAdminPhotos(search = "", status: "all" | "active" | "inactive" = "all") {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (status !== "all") params.append("status", status);

    const { response, error } = await fetchData(
      `/admin/photos${params.toString() ? `?${params.toString()}` : ""}`,
      { method: "GET" },
      () => {},
      "admin",
    );

    if (error) {
      throw new Error(extractErrorMessage(error));
    }

    return response?.photos || [];
  },

  async createPhoto(values: PhotoFormValues) {
    const token = getAdminToken();
    if (!token) throw new Error("Admin token is missing. Please log in again.");
    if (!values.image) throw new Error("Please select a photo image.");

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("description", values.description.trim());
    formData.append("altText", values.altText.trim());
    formData.append("isActive", String(values.isActive));
    formData.append("sortOrder", String(values.sortOrder));
    formData.append("image", values.image);

    const res = await fetch(`${API_BASE}/admin/photos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await readJsonSafe<{ message?: string; photo?: PhotoItem }>(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create photo");
    }

    return data?.photo || null;
  },

  async updatePhoto(photoId: string, values: PhotoFormValues) {
    const token = getAdminToken();
    if (!token) throw new Error("Admin token is missing. Please log in again.");

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("description", values.description.trim());
    formData.append("altText", values.altText.trim());
    formData.append("isActive", String(values.isActive));
    formData.append("sortOrder", String(values.sortOrder));
    if (values.image) {
      formData.append("image", values.image);
    }

    const res = await fetch(`${API_BASE}/admin/photos/${photoId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await readJsonSafe<{ message?: string; photo?: PhotoItem }>(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to update photo");
    }

    return data?.photo || null;
  },

  async deletePhoto(photoId: string) {
    const { response, error } = await fetchData(
      `/admin/photos/${photoId}`,
      { method: "DELETE" },
      () => {},
      "admin",
    );

    if (error) {
      throw new Error(extractErrorMessage(error));
    }

    return response;
  },
};

export default photoService;
