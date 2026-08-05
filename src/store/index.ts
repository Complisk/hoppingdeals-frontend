"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import promotionReducer from "./promotionSlice";
import adminReducer from "./adminSlice";

export const createAppStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      promotion: promotionReducer,
      admin: adminReducer,
    },
  });

export const store = createAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
