"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleId?: string;
  isSuperAdmin?: boolean;
  permissions?: Record<string, string[]>;
  avatarUrl?: string | null;
}

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  categories?: string[] | string;
  logoUrl?: string | null;
  personName?: string | null;
  businessAddress?: string | null;
  state?: string | null;
  timezone?: string;
  placeId?: string | null;
}

interface AuthState {
  userToken: string | null;
  businessToken: string | null;
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  error: string | null;
  accountType: "user" | "business" | null;
  adminToken?: string | null;
  adminUser?: User | null;
  adminPermissions?: Record<string, string[]> | "ALL" | null;
}

const getStorage = () =>
  typeof window !== "undefined" ? window.localStorage : null;

const getStorageItem = (key: string) => getStorage()?.getItem(key) ?? null;

const setStorageItem = (key: string, value: string) => {
  getStorage()?.setItem(key, value);
};

const removeStorageItem = (key: string) => {
  getStorage()?.removeItem(key);
};

const parseStorageItem = (key: string) => {
  try {
    const item = getStorageItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to parse ${key} from localStorage:`, error);
    removeStorageItem(key);
    return null;
  }
};

// SSR-safe: initial state never touches localStorage (undefined on the server).
// Auth is re-hydrated from localStorage on the client via `hydrateAuth`.
const initialState: AuthState = {
  userToken: null,
  businessToken: null,
  user: null,
  business: null,
  adminToken: null,
  adminUser: null,
  adminPermissions: null,
  isLoading: false,
  error: null,
  accountType: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // User actions
    setUserLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setUserSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.userToken = action.payload.token;
      state.accountType = "user";
      state.error = null;

      setStorageItem("userToken", action.payload.token);
      setStorageItem("user", JSON.stringify(action.payload.user));
      setStorageItem("accountType", "user");
    },

    // Admin actions
    setAdminLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setAdminSuccess: (
      state,
      action: PayloadAction<{ adminUser: any; token: string }>,
    ) => {
      state.isLoading = false;
      state.adminUser = action.payload.adminUser;
      state.adminToken = action.payload.token;
      state.error = null;

      const { adminUser, token } = action.payload;

      setStorageItem("adminToken", token);
      setStorageItem("adminUser", JSON.stringify(adminUser));

      // ✅ SAFE PERMISSIONS STORAGE
      const permissions = adminUser.isSuperAdmin
        ? "ALL"
        : adminUser.role?.permissions || {};

      setStorageItem("adminPermissions", JSON.stringify(permissions));
    },

    setAdminError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Business actions
    setBusinessLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setBusinessSuccess: (
      state,
      action: PayloadAction<{ business: Business; token: string }>,
    ) => {
      state.isLoading = false;
      state.business = action.payload.business;
      state.businessToken = action.payload.token;
      state.accountType = "business";
      state.error = null;
      setStorageItem("businessToken", action.payload.token);
      setStorageItem("business", JSON.stringify(action.payload.business));
      setStorageItem("accountType", "business");
    },
    setBusinessError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.userToken = null;
      state.businessToken = null;
      state.adminToken = null;
      state.user = null;
      state.business = null;
      state.adminUser = null;
      state.accountType = null;
      state.error = null;
      removeStorageItem("userToken");
      removeStorageItem("businessToken");
      removeStorageItem("adminToken");
      removeStorageItem("user");
      removeStorageItem("business");
      removeStorageItem("adminUser");
      removeStorageItem("accountType");
      removeStorageItem("adminPermissions");
      removeStorageItem("businessActiveSubscription");
    },

    clearError: (state) => {
      state.error = null;
    },

    // Next.js client hydration: restores auth state from localStorage after mount.
    hydrateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      const payload = action.payload || {};
      if (payload.userToken) state.userToken = payload.userToken;
      if (payload.businessToken) state.businessToken = payload.businessToken;
      if (payload.adminToken) state.adminToken = payload.adminToken;
      if (payload.user) state.user = payload.user;
      if (payload.business) state.business = payload.business;
      if (payload.adminUser) state.adminUser = payload.adminUser;
      if (payload.adminPermissions) state.adminPermissions = payload.adminPermissions;
      if (payload.accountType) state.accountType = payload.accountType;
    },
  },
});

export const {
  setUserLoading,
  setUserSuccess,
  setUserError,
  setBusinessLoading,
  setBusinessSuccess,
  setBusinessError,
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  logout,
  clearError,
  hydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;
