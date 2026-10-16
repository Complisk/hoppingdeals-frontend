"use client";
import fetchData from "@/utils/apiAction";

export const BUSINESS_ACTIVE_SUBSCRIPTION_KEY = "businessActiveSubscription";

const parseCachedSubscription = () => {
  try {
    const raw = localStorage.getItem(BUSINESS_ACTIVE_SUBSCRIPTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    localStorage.removeItem(BUSINESS_ACTIVE_SUBSCRIPTION_KEY);
    return null;
  }
};

export const readCachedBusinessSubscription = () => parseCachedSubscription();

export const writeCachedBusinessSubscription = (subscription: any) => {
  if (!subscription) {
    localStorage.removeItem(BUSINESS_ACTIVE_SUBSCRIPTION_KEY);
    return;
  }

  localStorage.setItem(
    BUSINESS_ACTIVE_SUBSCRIPTION_KEY,
    JSON.stringify(subscription),
  );
};

export const useSubscriptionService = () => {
  const checkout = async (id) => {
    const { response, error } = await fetchData(
      "/subscription/checkout",
      {
        method: "POST",
        data: { templateId: id },
      },
      () => {},
      "business",
    );

    if (error) throw new Error(error);
    return response;
  };

  const getActive = async () => {
    const { response, error } = await fetchData(
      "/subscription/active",
      {
        method: "GET",
      },
      () => {},
      "business",
    );
    if (error) throw new Error(error);
    writeCachedBusinessSubscription(response || null);
    return response || null;
  };

  const getHistory = async (page = 1, limit = 20) => {
    const { response, error } = await fetchData(
      `/subscription/history?page=${page}&limit=${limit}`,
      { method: "GET" },
      () => {},
      "business",
    );
    if (error) throw new Error(error);
    return response;
  };

  return { checkout, getActive, getHistory, getCachedActive: readCachedBusinessSubscription };
};

export default useSubscriptionService;
