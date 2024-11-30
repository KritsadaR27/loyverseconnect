// frontend/app/sales/monthlycategorysales/components/MonthlyCategorySalesActionBar.js

import React from 'react';
import { DateRange } from "react-date-range";
import { th } from "date-fns/locale"; // สำหรับแสดงภาษาไทย
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from 'date-fns';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const MonthlyCategorySalesActionBar = ({ dateRange, setDateRange, showPicker, setShowPicker, applyDateRange, displayMode, setDisplayMode }) => {
    const handleDateChange = (range) => {
        setDateRange([range.selection]);
    };

    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            <div className="flex space-x-2">
                <button
                    onClick={() => setDisplayMode("quantity")}
                    className={`px-4 py-2 rounded ${displayMode === "quantity" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    <ShoppingCartIcon className="h-5 w-5 inline" /> จำนวนที่ขาย
                </button>
                <button
                    onClick={() => setDisplayMode("sales")}
                    className={`px-4 py-2 rounded ${displayMode === "sales" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    <CurrencyDollarIcon className="h-5 w-5 inline" /> ยอดขายรวม
                </button>
                <button
                    onClick={() => setDisplayMode("profit")}
                    className={`px-4 py-2 rounded ${displayMode === "profit" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                    <ChartBarIcon className="h-5 w-5 inline" /> กำไรสุทธิ
                </button>
            </div>
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="border border-gray-300 px-4 py-2 rounded"
                >
                    {`${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`}
                </button>

                {showPicker && (
                    <div className="absolute z-10 mt-2 bg-white shadow-lg p-4 rounded flex">
                        <DateRange
                            editableDateInputs={true}
                            onChange={handleDateChange}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                            locale={th}
                            minDate={new Date("2022-01-01")}
                            maxDate={new Date()}
                            showMonthAndYearPickers={true}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                            <button
                                onClick={() => setShowPicker(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={applyDateRange}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                ตกลง
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyCategorySalesActionBar;