import React, { useState, useEffect } from 'react';
import { formatDateToThai } from '../app/utils/dateUtils';

const DatePicker = ({ label = "เลือกวันที่:", selectedDate, setSelectedDate }) => {
    const handleDateChange = (e) => {
        const date = new Date(e.target.value);
        // ตั้งค่าให้เป็นวันที่ UTC เพื่อลดผลกระทบของ timezone
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        setSelectedDate(utcDate);
    };

    return (
        <div className="mb-5 w-full max-w-screen-lg text-center mx-auto">
            <span className="text-gray-700 font-medium">{label}</span>
            <input 
                type="date" 
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateChange}
                className="ml-3 p-2 border rounded bg-white text-gray-700 mt-2 shadow-md" 
            />
            <div className="text-gray-500 mt-2">
                {`วันที่ไทย: ${formatDateToThai(selectedDate, "วัน ที่ dd/mm/yyyy")}`}
            </div>
        </div>
    );
};

export default DatePicker;
