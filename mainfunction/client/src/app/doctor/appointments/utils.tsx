import React from "react";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "text-primary bg-primary/10 border border-primary/20";
    case "Completed":
      return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    case "Cancelled":
      return "text-red-700 bg-red-50 border border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border border-gray-200";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "Scheduled":
      return <FaHourglassHalf />;
    case "Completed":
      return <FaCheckCircle />;
    case "Cancelled":
      return <FaTimesCircle />;
    default:
      return <FaHourglassHalf />;
  }
};
