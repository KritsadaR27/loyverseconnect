// src/utils/dateUtils.js

export const formatDateToThai = (date, format = "วัน dd/mm/yyyy เวลา HH:MM น.") => {
    const daysOfWeek = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthThai = months[date.getMonth()];
    const year = date.getFullYear();
    const yearThai = (year + 543).toString();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return format
        .replace("วัน", dayOfWeek)
        .replace("dd", day)
        .replace("mm", month)
        .replace("เดือน", monthThai)
        .replace("yyyy", year)
        .replace("พ.ศ.", yearThai)
        .replace("HH", hours)
        .replace("MM", minutes);
};

export const addDaysToDate = (date, days) => {
    const result = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + days));
    return result;
};