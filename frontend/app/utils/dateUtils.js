// src/utils/dateUtils.js
// src/utils/dateUtils.js
export const formatDateToThai = (date, format = "วัน dd เดือน พ.ศ.", timeZone = 'Asia/Bangkok') => {
    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date)) {
        console.error("Invalid date:", date);
        return ""; // หรือ return ค่าเริ่มต้นหาก date ไม่ถูกต้อง
    }

    const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

    // Adjust date to Thai timezone
    const dateInThaiZone = new Date(new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }).format(date));

    const dayOfWeek = daysOfWeek[dateInThaiZone.getUTCDay()];
    const day = dateInThaiZone.getDate().toString().padStart(2, '0');
    const month = (dateInThaiZone.getMonth() + 1).toString().padStart(2, '0');
    const monthThai = months[dateInThaiZone.getMonth()];
    const year = dateInThaiZone.getFullYear();
    const yearThai = (year + 543).toString();

    const hours = dateInThaiZone.getHours().toString().padStart(2, '0');
    const minutes = dateInThaiZone.getMinutes().toString().padStart(2, '0');

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