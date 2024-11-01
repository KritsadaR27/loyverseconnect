// src/utils/calculateNextOrderDate.js
import { addDaysToDate } from './dateUtils';

const daysOfWeek = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export const calculateNextOrderDate = (startDate, orderCycle, selectedDays = []) => {
    const dayOfWeek = startDate.getUTCDay(); // ใช้ getUTCDay เพื่อให้สอดคล้องกับ timezone UTC
    let nextDate;

    // ฟังก์ชันหาวันที่ใกล้ที่สุดที่ตรงกับ selectedDays
    const findClosestDay = (date, days) => {
        for (let i = 0; i < 7; i++) {
            const nextDate = addDaysToDate(date, i); // เพิ่มวันไปทีละวัน
            const nextDay = daysOfWeek[nextDate.getUTCDay()]; // หาวันในสัปดาห์
            if (days.includes(nextDay)) return nextDate; // ถ้าวันตรงกับ selectedDays ให้คืนค่าวันนั้น
        }
        return date; // ถ้าไม่เจอให้คืนค่าวันเดิม
    };

    switch (orderCycle) {
        case "":
            nextDate = "ไม่ได้กำหนด";
            break;
        case "daily":
            nextDate = addDaysToDate(startDate, 1);
            break;
        case "alternateMon":
            nextDate = dayOfWeek === 1 ? addDaysToDate(startDate, 2) : addDaysToDate(startDate, 1);
            break;
        case "alternateTue":
            nextDate = dayOfWeek === 2 ? addDaysToDate(startDate, 2) : addDaysToDate(startDate, 1);
            break;
        case "selectDays":
            // กรณีเลือกวัน ให้ใช้ findClosestDay เพื่อหาวันที่ตรงกับ selectedDays
            nextDate = findClosestDay(startDate, selectedDays);
            break;
        case "exceptDays":
            nextDate = addDaysToDate(startDate, 1);
            while (selectedDays.includes(daysOfWeek[nextDate.getUTCDay()])) {
                nextDate = addDaysToDate(nextDate, 1);
            }
            break;
        default:
            nextDate = addDaysToDate(startDate, 1);
            break;
    }
    return nextDate;
};
