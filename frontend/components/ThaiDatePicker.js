import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { formatDateToThai } from '../../../utils/dateUtils';


const ThaiDatePicker = () => {
    const [selectedDate, setSelectedDate] = useState(null);

    return (
        <div>
            <h3>เลือกวันที่:</h3>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                customInput={
                    <CustomInput date={selectedDate} formatDateToThai={formatDateToThai} />
                }
                placeholderText="เลือกวันที่"
            />
        </div>
    );
};

// Custom input component to use with React Datepicker
const CustomInput = ({ value, onClick, date, formatDateToThai }) => (
    <button className="example-custom-input" onClick={onClick}>
        {date ? formatDateToThai(date, "วัน dd เดือน พ.ศ.") : "เลือกวันที่"}
    </button>
);

export default ThaiDatePicker;