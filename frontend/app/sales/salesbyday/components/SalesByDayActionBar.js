// frontend/app/sales/salesbyday/components/SalesByDayActionBar.js

import React from 'react';
import { DateRange } from "react-date-range";
import { th } from "date-fns/locale"; // สำหรับแสดงภาษาไทย
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const SalesByDayActionBar = ({ dateRange, setDateRange, showPicker, setShowPicker, handlePresetClick, applyDateRange }) => {
    const handleDateChange = (range) => {
        setDateRange([range.selection]);
    };

    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            <div className="relative">
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="border border-gray-300 px-4 py-2 rounded"
                >
                    {`${dateRange[0].startDate.toLocaleDateString("th-TH")} - ${dateRange[0].endDate.toLocaleDateString("th-TH")}`}
                </button>

                {showPicker && (
                    <div className="absolute z-10 mt-2 bg-white shadow-lg p-4 rounded flex">
                        {/* Preset Buttons */}
                        <div className="flex flex-col pr-4 border-r border-gray-300">
                            {["วันนี้", "เมื่อวานนี้", "สัปดาห์นี้", "สัปดาห์ที่แล้ว", "เดือนนี้", "เดือนที่แล้ว", "7 วันล่าสุด", "30 วันที่แล้ว"].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => handlePresetClick(preset)}
                                    className="px-4 py-2 rounded hover:bg-gray-300 mb-2 text-left"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        {/* Date Range Picker */}
                        <div className="ml-4">
                            <DateRange
                                editableDateInputs={true}
                                onChange={handleDateChange}
                                moveRangeOnFirstSelection={false}
                                ranges={dateRange}
                                locale={th}
                            />

                            {/* Action Buttons */}
                            <div className="flex justify-end mt-4 space-x-2">
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
                                    เสร็จแล้ว
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesByDayActionBar;