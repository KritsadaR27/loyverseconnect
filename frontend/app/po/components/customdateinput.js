// frontend/app/po/component/customdateinput.js
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const CustomDateInput = ({ value, onClick, date, formatDateToThai }) => (
    <button
        className="flex items-center bg-green-500 text-white rounded-lg px-3 py-2"
        onClick={onClick}
    >
        <span>{date ? formatDateToThai(date, "วัน dd เดือน พ.ศ.") : "เลือกวันที่"}</span>
        <CalendarDaysIcon className="h-5 w-5 ml-2" /> {/* เพิ่มไอคอนแก้ไขที่นี่ */}
    </button> 
); 

export default CustomDateInput; 
