"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    suspended: number;
  };
  businesses: {
    total: number;
    active: number;
    blocked: number;
    withAutoApprove: number;
  };
  promotions: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
  };
  revenue: {
    total: number;
  };
  engagement: {
    totalViews: number;
    totalClicks: number;
    clickThroughRate: string;
  };
  recentActivity: {
    users: any[];
    promotions: any[];
  };
}

interface AdminState {
  loading: boolean;
  success: string | null;
  error: string | null;
  dashboardData: DashboardStats | null;
  usersList: {
    users: any[];
    pagination: any;
  } | null;
  businessesList: {
    businesses: any[];
    pagination: any;
  } | null;
  promotionsList: {
    promotions: any[];
    pagination: any;
  } | null;
}

const initialState: AdminState = {
  loading: false,
  success: null,
  error: null,
  dashboardData: null,
  usersList: null,
  businessesList: null,
  promotionsList: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminLoading: (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    },
    setAdminSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    setAdminError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.success = null;
    },
    setDashboardData: (state, action: PayloadAction<DashboardStats>) => {
      state.dashboardData = action.payload;
    },
    setUsersList: (
      state,
      action: PayloadAction<{
        users: any[];
        pagination: any;
      }>
    ) => {
      state.usersList = action.payload;
    },
    setBusinessesList: (
      state,
      action: PayloadAction<{
        businesses: any[];
        pagination: any;
      }>
    ) => {
      state.businessesList = action.payload;
    },
    setPromotionsList: (
      state,
      action: PayloadAction<{
        promotions: any[];
        pagination: any;
      }>
    ) => {
      state.promotionsList = action.payload;
    },
    clearAdmin: (state) => {
      state.loading = false;
      state.success = null;
      state.error = null;
      state.dashboardData = null;
      state.usersList = null;
      state.businessesList = null;
      state.promotionsList = null;
    },
  },
});

export const {
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  setDashboardData,
  setUsersList,
  setBusinessesList,
  setPromotionsList,
  clearAdmin,
} = adminSlice.actions;

export default adminSlice.reducer;
