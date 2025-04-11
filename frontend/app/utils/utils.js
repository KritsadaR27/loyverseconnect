// lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { th } from "date-fns/locale";

/**
 * รวม class names ด้วย clsx และ tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * ฟอร์แมตตัวเลขให้มีคอมมา
 * @param {number} value ตัวเลขที่ต้องการฟอร์แมต
 * @param {number} digits จำนวนตำแหน่งทศนิยม (ถ้ามี)
 * @returns {string} ตัวเลขที่ฟอร์แมตแล้ว
 */
export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined) return "-";
  
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * ฟอร์แมตวันที่
 * @param {Date} date วันที่
 * @param {string} formatStr รูปแบบการฟอร์แมต
 * @returns {string} วันที่ที่ฟอร์แมตแล้ว
 */
export function formatDate(date, formatStr = "dd/MM/yyyy") {
  if (!date) return "-";
  
  // ตรวจสอบถ้าเป็นวันนี้, เมื่อวาน, หรือพรุ่งนี้
  if (isToday(date)) return `วันนี้ (${format(date, formatStr, { locale: th })})`;
  if (isYesterday(date)) return `เมื่อวาน (${format(date, formatStr, { locale: th })})`;
  if (isTomorrow(date)) return `พรุ่งนี้ (${format(date, formatStr, { locale: th })})`;
  
  return format(date, formatStr, { locale: th });
}

/**
 * ดึงค่าจาก localStorage พร้อมทั้งแปลงจาก JSON
 * @param {string} key คีย์ที่ต้องการดึงค่า
 * @param {any} defaultValue ค่าเริ่มต้นถ้าไม่พบข้อมูล
 * @returns {any} ค่าที่ดึงได้
 */
export function getLocalStorage(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * บันทึกค่าลงใน localStorage โดยแปลงเป็น JSON
 * @param {string} key คีย์ที่ต้องการบันทึก
 * @param {any} value ค่าที่ต้องการบันทึก
 */
export function setLocalStorage(key, value) {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * สร้าง unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * หน่วงเวลา (sleep)
 * @param {number} ms เวลาที่ต้องการหน่วง (มิลลิวินาที)
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// lib/utils.js
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * Format a number with commas
 * @param {number} value - The number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  
  return new Intl.NumberFormat('th-TH').format(value);
}

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '฿0';
  
  return new Intl.NumberFormat('th-TH', { 
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0
  }).format(value);
}

/**
 * Format a date according to the given format string
 * @param {Date|string} date - Date object or string
 * @param {string} formatStr - Format string (e.g., 'dd/MM/yyyy')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, formatStr = 'dd/MM/yyyy') {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: th });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date as Thai format
 * @param {Date|string} date - Date object or string
 * @param {string} formatStr - Format string (default: 'dd MMMM yyyy')
 * @returns {string} - Formatted Thai date
 */
export function formatDateToThai(date, formatStr = 'dd MMMM yyyy') {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr, { locale: th });
  } catch (error) {
    console.error('Error formatting Thai date:', error);
    return '';
  }
}

/**
 * Remove prefix from store name (e.g., "ลุงรวย สาขา" -> "")
 * @param {string} storeName - The original store name
 * @returns {string} - Normalized store name
 */
export function normalizeStoreName(storeName) {
  if (!storeName) return '';
  
  return storeName.replace("ลุงรวย สาขา", "").trim();
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param {*} value - The value to check
 * @returns {boolean} - True if empty, false otherwise
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Generate a random ID string
 * @param {number} length - The length of the ID
 * @returns {string} - Random ID string
 */
export function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

/**
 * Get a color based on a status or value
 * @param {string|number} status - The status or value to get a color for
 * @returns {string} - CSS color class
 */
export function getStatusColor(status) {
  if (typeof status === 'number') {
    if (status < 0) return 'text-red-600';
    if (status < 20) return 'text-yellow-600';
    return 'text-green-600';
  }
  
  // String status
  switch (status?.toLowerCase()) {
    case 'success':
    case 'approved':
    case 'active':
      return 'text-green-600';
    case 'warning':
    case 'pending':
      return 'text-yellow-600';
    case 'error':
    case 'failed':
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Check if a device is mobile based on window width
 * @returns {boolean} - True if mobile, false otherwise
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Format a file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}