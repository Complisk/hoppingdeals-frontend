"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";

export type SupportSenderType = "customer" | "business";

export interface SupportMessagePayload {
  senderType: SupportSenderType;
  name: string;
  email: string;
  subject: string;
  body: string;
}

export const submitSupportMessage = async (payload: SupportMessagePayload) => {
  const { response, error } = await fetchData(
    "/support/messages",
    {
      method: "POST",
      data: payload,
    },
    () => {},
    null,
  );

  if (error) {
    throw new Error(extractErrorMessage(error));
  }

  return response;
};

