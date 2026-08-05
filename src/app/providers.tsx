"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "@/store";
import { hydrateAuth } from "@/store/authSlice";
import { useAppDispatch } from "@/hooks/use-redux";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * Re-hydrates auth state from localStorage after mount.
 * The initial Redux state is intentionally empty so SSR and hydration match.
 */
function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const parse = (key: string) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      };
      dispatch(
        hydrateAuth({
          userToken: window.localStorage.getItem("userToken"),
          businessToken: window.localStorage.getItem("businessToken"),
          adminToken: window.localStorage.getItem("adminToken"),
          user: parse("user"),
          business: parse("business"),
          adminUser: parse("adminUser"),
          adminPermissions: parse("adminPermissions"),
          accountType:
            (window.localStorage.getItem("accountType") as
              | "user"
              | "business"
              | null) || null,
        }),
      );
    } catch (error) {
      console.error("Failed to hydrate auth from localStorage:", error);
    }
  }, [dispatch]);

  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthHydrator />
          <ToastContainer position="top-right" autoClose={5000} />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}
