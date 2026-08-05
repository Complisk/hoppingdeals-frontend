"use client";
/**
 * Error Handler Utility
 * Extracts error messages from various error formats
 */

/**
 * Extract error message from various error structures
 * Handles:
 * - { message: "error string" }
 * - { error: "error string" }
 * - Error objects with message property
 * - Plain strings
 */
export const extractErrorMessage = (error: any): string => {
  // If error is already a string, return it
  if (typeof error === "string") {
    return error;
  }

  // Check for message property (API response format)
  if (error?.message && typeof error.message === "string") {
    return error.message;
  }

  // Check for error property
  if (error?.error && typeof error.error === "string") {
    return error.error;
  }

  // Check for data.message (axios error response)
  if (error?.data?.message && typeof error.data.message === "string") {
    return error.data.message;
  }

  // Default error message
  return "An error occurred. Please try again.";
};

/**
 * Status meanings for promotions
 */
export const getStatusMeaning = (status: string): string => {
  const meanings: Record<string, string> = {
    active: "Running - Promotion is currently active and running",
    inactive: "Not Running - Promotion has stopped or expired",
    pending: "Not Approved - Waiting for admin approval",
    approved: "Approved - Ready to run",
    rejected: "Rejected - Admin has rejected this promotion",
    expired: "Expired - Promotion duration has ended",
  };

  return meanings[status.toLowerCase()] || `Status: ${status}`;
};

/**
 * Get status color class
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };

  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
};
