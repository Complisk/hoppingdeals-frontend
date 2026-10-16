"use client";
import fetchData from "@/utils/apiAction";
export interface SubscriptionTemplate {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  freeCities: number;
  freeStates: number;
  freeTimezones: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useSubscriptionTemplateService = () => {
  const getErrorMessage = (error: any) =>
    error?.message || error?.error || "Request failed";

  // Get all active subscription templates
  const getAllTemplates = async (): Promise<SubscriptionTemplate[]> => {
    const { response, error } = await fetchData(
      "/subscription-template",
      {
        method: "GET",
      },
      () => {},
    );

    if (error) throw new Error(getErrorMessage(error));
    return response || [];
  };

  // Create a new subscription template (Admin only)
  const createTemplate = async (data: Partial<SubscriptionTemplate>) => {
    const { response, error } = await fetchData(
      "/subscription-template",
      {
        method: "POST",
        data,
      },
      () => {},
      "admin",
    );

    if (error) throw new Error(getErrorMessage(error));
    return response;
  };

  // Update an existing subscription template (Admin only)
  const updateTemplate = async (
    id: string,
    data: Partial<SubscriptionTemplate>,
  ) => {
    const { response, error } = await fetchData(
      `/subscription-template/${id}`,
      {
        method: "PUT",
        data,
      },
      () => {},
      "admin",
    );

    if (error) throw new Error(getErrorMessage(error));
    return response;
  };

  // Delete a subscription template (Admin only)
  const deleteTemplate = async (id: string) => {
    const { response, error } = await fetchData(
      `/subscription-template/${id}`,
      {
        method: "DELETE",
      },
      () => {},
      "admin",
    );

    if (error) throw new Error(getErrorMessage(error));
    return response;
  };

  return { getAllTemplates, createTemplate, updateTemplate, deleteTemplate };
};

export default useSubscriptionTemplateService;
