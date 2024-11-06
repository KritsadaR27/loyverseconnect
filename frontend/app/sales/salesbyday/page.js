"use client";
import React, { useState } from "react";
import axios from "axios";
import Navigation from "../../../components/Navigation";
import { DateRange } from "react-date-range";
import { th } from "date-fns/locale"; // สำหรับแสดงภาษาไทย
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function SalesByDay() {
  const [pivotData, setPivotData] = useState([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);

  const fetchSalesByDay = async (startDate, endDate) => {
    try {
      const response = await axios.get("http://localhost:8084/api/sales/days", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      const salesData = response.data;
      const pivotedData = transformSalesData(salesData);
      setPivotData(pivotedData);
    } catch (error) {
      console.error("Error fetching sales by day:", error);
    }
  };

  const handleDateChange = (range) => {
    setDateRange([range.selection]);
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case "วันนี้":
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "เมื่อวานนี้":
        startDate = new Date(today.setDate(today.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "สัปดาห์นี้":
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        startDate = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case "สัปดาห์ที่แล้ว":
        const firstDayOfLastWeek = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        startDate = new Date(firstDayOfLastWeek.setHours(0, 0, 0, 0));
        const lastDayOfLastWeek = new Date(startDate);
        endDate = new Date(lastDayOfLastWeek.setDate(lastDayOfLastWeek.getDate() + 6));
        endDate.setHours(23, 59, 59, 999);
        break;
      case "เดือนนี้":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case "เดือนที่แล้ว":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "7 วันที่แล้ว":
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case "30 วันที่แล้ว":
        startDate = new Date(today.setDate(today.getDate() - 30));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    setDateRange([{ startDate, endDate, key: "selection" }]);
    fetchSalesByDay(startDate, endDate);
    setShowPicker(false); // ปิด picker หลังจากเลือก preset
  };

  const applyDateRange = () => {
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // ปรับเวลา endDate ให้ครอบคลุมถึงสิ้นวัน
    fetchSalesByDay(dateRange[0].startDate, adjustedEndDate);
    setShowPicker(false);
  };

  const transformSalesData = (data) => {
    const result = {};
    const dates = new Set();

    data.forEach((sale) => {
      const { sale_date, item_name, total_quantity } = sale;
      dates.add(sale_date);

      if (!result[item_name]) {
        result[item_name] = { item_name };
      }
      result[item_name][sale_date] = total_quantity;
    });

    return { items: Object.values(result), dates: Array.from(dates).sort() };
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-4">Sales by Day</h1>

        {/* Button for opening Date Picker */}
        <div className="mb-4 relative">
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

        {/* Table displaying pivoted sales data */}
        <table className="min-w-full bg-white border-black table-fixed">
          <thead>
            <tr>
              <th className="border-black border">Item Name</th>
              {pivotData.dates &&
                pivotData.dates.map((date) => (
                  <th key={date} className="border-black border">
                    {new Date(date).toLocaleDateString("th-TH", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {pivotData.items &&
              pivotData.items.map((item) => (
                <tr key={item.item_name}>
                  <td className="border-black border text-left">
                    {item.item_name}
                  </td>
                  {pivotData.dates.map((date) => (
                    <td key={date} className="border-black border text-center">
                      {item[date] || 0}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
