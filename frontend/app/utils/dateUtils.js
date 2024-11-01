// src/utils/dateUtils.js

export const formatDateToThai = (date, format = "วัน ที่ dd/mm/yyyy") => {
    const daysOfWeek = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    const day = date.getDate().toString().padStart(2, '0'); // เติม 0 ข้างหน้าถ้าตัวเลขเป็นหลักเดียว
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return format
        .replace("วัน", dayOfWeek)
        .replace("dd", day)
        .replace("mm", month)
        .replace("yyyy", year);
};

export const addDaysToDate = (date, days) => {
    const result = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + days));
    return result;
};