"use client";
import { useApi } from "@/hooks/useApi";

export interface Template {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Template Service - Centralized template API layer
 * Uses the unified useApi hook for all template API calls
 */
export const useTemplateService = () => {
  const { call } = useApi();

  // Get all available templates (admin uploaded)
  const getTemplates = async (): Promise<Template[]> => {
    try {
      const result: any = await call(
        "/promotions/templates",
        {
          method: "GET",
        },
        null,
        true // Public endpoint - not protected
      );

      const data = result?.response ?? result;
      return Array.isArray(data) ? data : data?.templates || [];
    } catch (error) {
      console.error("Get templates error:", error);
      throw error;
    }
  };

  return {
    getTemplates,
  };
};

export default useTemplateService;
