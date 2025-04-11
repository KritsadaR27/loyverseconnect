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