"use client";
import * as React from "react";
import type { ReactNode } from "react";
import { toast as toastifyToast } from "react-toastify";

type Variant = "default" | "destructive";

export type AppToast = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: Variant;
};

const isProbablyErrorTitle = (title?: ReactNode) => {
  if (!title) return false;
  if (typeof title !== "string") return false;
  return /(error|failed|invalid|denied|unauthorized)/i.test(title);
};

const toastContent = (title?: ReactNode, description?: ReactNode) => {
  if (!title && !description) return "";
  if (title && !description) return title;
  if (!title && description) return description;

  return React.createElement(
    "div",
    null,
    React.createElement("div", { className: "font-semibold" }, title),
    React.createElement("div", { className: "mt-1" }, description),
  );
};

function toast({ title, description, variant }: AppToast) {
  const isError = variant === "destructive" || isProbablyErrorTitle(title);
  const content = toastContent(title, description);

  const id = isError ? toastifyToast.error(content) : toastifyToast.success(content);

  return {
    id,
    dismiss: () => toastifyToast.dismiss(id),
    update: () => {},
  };
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: (toastId?: string) =>
      toastId ? toastifyToast.dismiss(toastId) : toastifyToast.dismiss(),
  };
}

export { useToast, toast };
