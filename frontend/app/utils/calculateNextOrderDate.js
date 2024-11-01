// src/utils/calculateNextOrderDate.js
import { addDays } from './dateUtils';

const daysOfWeek = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

function addDaysToDate(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const calculateNextOrderDate = (startDate, orderCycle, selectedDays = []) => {
    const dayOfWeek = startDate.getDay();
    let nextDate;

    const findClosestDay = (date, days) => {
        for (let i = 1; i <= 7; i++) {
            const nextDate = addDaysToDate(date, i);
            const nextDay = daysOfWeek[nextDate.getDay()];
            if (days.includes(nextDay)) return nextDate;
        }
        return date; 
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
            nextDate = findClosestDay(startDate, selectedDays);
            break;
        case "exceptDays":
            nextDate = addDaysToDate(startDate, 1);
            while (selectedDays.includes(daysOfWeek[nextDate.getDay()])) {
                nextDate = addDaysToDate(nextDate, 1);
            }
            break;
        default:
            nextDate = addDaysToDate(startDate, 1);
            break;
    }
    return nextDate;
};
