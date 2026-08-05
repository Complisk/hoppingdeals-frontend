"use client";
import { useCallback } from "react";
import fetchData from "@/utils/apiAction";

/**
 * UNIFIED CUSTOM HOOK FOR ALL API CALLS
 * This is the ONLY custom hook needed for API operations
 * All API calls should go through services that use this hook
 *
 * NEVER create additional custom hooks - use services instead!
 *
 * @example
 * // In a service file
 * const { call } = useApi();
 * const response = await call("/endpoint", { method: "POST", body: {...} });
 *
 * // In a component
 * const { loginUser } = useAuthService();
 * const result = await loginUser(email, password);
 */
export const useApi = () => {
  const call = useCallback(
    async (endpoint, options = {}, callback = null, notProtected = false) => {
      return await fetchData(endpoint, options, callback, notProtected);
    },
    []
  );

  return { call };
};
