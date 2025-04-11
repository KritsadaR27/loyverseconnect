// frontend/lib/utils.js

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ✅ เพิ่มตรงนี้
export const formatNumber = (value) =>
  value?.toLocaleString("th-TH", { maximumFractionDigits: 0 });

export const formatDate = (date, format = "dd/MM/yyyy") =>
  new Date(date).toLocaleDateString("th-TH");
