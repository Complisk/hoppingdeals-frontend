"use client";
import fetchData from "@/utils/apiAction";

export interface BusinessPromotionTemplateTextItem {
  id: string;
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

export interface BusinessPromotionTemplate {
  id: string;
  businessId: string;
  name: string;
  templateId: string | null;
  imageUrl: string;
  text: BusinessPromotionTemplateTextItem[];
  backgroundColor: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBusinessPromotionTemplatePayload {
  name?: string;
  templateId?: string | null;
  imageUrl: string;
  text: BusinessPromotionTemplateTextItem[];
  backgroundColor?: string | number | null;
  metadata?: Record<string, any>;
}

export const useBusinessPromotionTemplateService = () => {
  const getTemplates = async () => {
    const { response, error } = await fetchData(
      "/business/promotion-templates",
      { method: "GET" },
      () => {},
      "business",
    );

    if (error) throw new Error((error as any)?.message || "Failed to load templates");
    return Array.isArray(response?.templates) ? response.templates : [];
  };

  const getTemplateById = async (id: string) => {
    const { response, error } = await fetchData(
      `/business/promotion-templates/${id}`,
      { method: "GET" },
      () => {},
      "business",
    );

    if (error) throw new Error((error as any)?.message || "Failed to load template");
    return response?.template || null;
  };

  const createTemplate = async (payload: SaveBusinessPromotionTemplatePayload) => {
    const { response, error } = await fetchData(
      "/business/promotion-templates",
      {
        method: "POST",
        data: payload,
      },
      () => {},
      "business",
    );

    if (error) throw new Error((error as any)?.message || "Failed to create template");
    return response?.template || null;
  };

  const updateTemplate = async (
    id: string,
    payload: Partial<SaveBusinessPromotionTemplatePayload>,
  ) => {
    const { response, error } = await fetchData(
      `/business/promotion-templates/${id}`,
      {
        method: "PUT",
        data: payload,
      },
      () => {},
      "business",
    );

    if (error) throw new Error((error as any)?.message || "Failed to update template");
    return response?.template || null;
  };

  const deleteTemplate = async (id: string) => {
    const { response, error } = await fetchData(
      `/business/promotion-templates/${id}`,
      { method: "DELETE" },
      () => {},
      "business",
    );

    if (error) throw new Error((error as any)?.message || "Failed to delete template");
    return response;
  };

  return {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

export default useBusinessPromotionTemplateService;
