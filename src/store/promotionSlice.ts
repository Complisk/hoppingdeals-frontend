"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Promotion {
  id: string;
  name?: string;
  category: string;
  status: string;
  cities?: Array<any>;
  states?: Array<any>;
  timezones?: Array<string>;
  [key: string]: any;
}

interface PromotionState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  // Featured promotions state
  featuredPromotions: Promotion[];
  featuredLoading: boolean;
  featuredError: string | null;
}

const initialState: PromotionState = {
  isLoading: false,
  error: null,
  successMessage: null,
  featuredPromotions: [],
  featuredLoading: false,
  featuredError: null,
};

const promotionSlice = createSlice({
  name: "promotion",
  initialState,
  reducers: {
    // Create promotion actions
    setPromotionLoading: (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    },
    setPromotionSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = null;
      state.successMessage = action.payload;
    },
    setPromotionError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.successMessage = null;
    },

    clearPromotionState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.successMessage = null;
    },

    clearPromotionError: (state) => {
      state.error = null;
    },

    // Featured promotions actions
    setFeaturedPromotionsLoading: (state) => {
      state.featuredLoading = true;
      state.featuredError = null;
    },
    setFeaturedPromotionsSuccess: (
      state,
      action: PayloadAction<Promotion[]>,
    ) => {
      state.featuredLoading = false;
      state.featuredError = null;
      state.featuredPromotions = action.payload;
    },
    setFeaturedPromotionsError: (state, action: PayloadAction<string>) => {
      state.featuredLoading = false;
      state.featuredError = action.payload;
      state.featuredPromotions = [];
    },
    clearFeaturedPromotions: (state) => {
      state.featuredPromotions = [];
      state.featuredLoading = false;
      state.featuredError = null;
    },
  },
});

export const {
  setPromotionLoading,
  setPromotionSuccess,
  setPromotionError,
  clearPromotionState,
  clearPromotionError,
  setFeaturedPromotionsLoading,
  setFeaturedPromotionsSuccess,
  setFeaturedPromotionsError,
  clearFeaturedPromotions,
} = promotionSlice.actions;

export default promotionSlice.reducer;
