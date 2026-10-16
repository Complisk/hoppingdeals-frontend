"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";

export type SupportSenderTypeFilter = "all" | "customer" | "business";

export interface SupportMessageRow {
  id: string;
  senderType: "customer" | "business";
  name: string;
  email: string;
  subject: string;
  body: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface SupportMessagesResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  messages: SupportMessageRow[];
}

export const getSupportMessages = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  senderType?: SupportSenderTypeFilter;
}) => {
  const query = new URLSearchParams();
  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 20));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.senderType && params.senderType !== "all")
    query.set("senderType", params.senderType);

  const { response, error } = await fetchData(
    `/admin/support-messages?${query.toString()}`,
    { method: "GET" },
    () => {},
    "admin",
  );

  if (error) throw new Error(extractErrorMessage(error));
  return response as SupportMessagesResponse;
};

export const downloadSupportMessagesCsv = async (params: {
  search?: string;
  senderType?: SupportSenderTypeFilter;
}) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.senderType && params.senderType !== "all")
    query.set("senderType", params.senderType);

  const token = localStorage.getItem("adminToken");
  const res = await fetch(
    `${baseUrl}/admin/support-messages/export?${query.toString()}`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    },
  );

  if (!res.ok) {
    let message = "Export failed";
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await res.blob();
  const fileName =
    res.headers
      .get("content-disposition")
      ?.match(/filename="([^"]+)"/)?.[1] || "support-messages.csv";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

