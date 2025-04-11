// app/utils/dateUtils.js
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


// frontend/app/utils/dateUtils.js

// ฟังก์ชันสำหรับแปลงวันภาษาอังกฤษเป็นภาษาไทย
export const getThaiDay = (date) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[date.getDay()];
  };
  
  // ฟังก์ชันสำหรับฟอร์แมตวันที่แบบไทย
  export const formatThaiDate = (date, format = 'full') => {
    if (!date) return '';
    
    // สร้าง Date object ใหม่จาก input
    const dateObj = new Date(date);
    
    // วันที่ เดือน ปี
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    
    // ชื่อวันภาษาไทย
    const thaiDay = getThaiDay(dateObj);
    
    // ชื่อเดือนภาษาไทย
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiMonth = thaiMonths[month];
    
    // ปีพุทธศักราช
    const buddhistYear = year + 543;
    
    // รูปแบบต่างๆ
    switch (format) {
      case 'full':
        return `วัน${thaiDay}ที่ ${day} ${thaiMonth} พ.ศ. ${buddhistYear}`;
      case 'medium':
        return `${thaiDay} ${day} ${thaiMonth} ${buddhistYear}`;
      case 'short':
        return `${thaiDay} ${day}/${month + 1}/${buddhistYear.toString().substr(2)}`;
      case 'day-only':
        return thaiDay;
      case 'date-only':
        return `${day}/${month + 1}/${buddhistYear.toString().substr(2)}`;
      case 'day-month':
        return `${thaiDay} ${day}/${month + 1}`;
      default:
        return `${day}/${month + 1}/${buddhistYear}`;
    }
  };