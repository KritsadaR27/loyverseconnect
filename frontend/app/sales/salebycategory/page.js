"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
import { th } from "date-fns/locale"; // สำหรับแสดงภาษาไทย
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Navigation from "../../../components/Navigation";
import { format } from 'date-fns';

export default function MonthlyCategorySales() {
  const [salesData, setSalesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [displayMode, setDisplayMode] = useState("quantity"); // "quantity", "sales", or "profit"
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2024-09-24 14:00:00"), // Starting from 2022
      endDate: new Date("2024-09-25 14:00:00"),               // Until today
      key: "selection",
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);

  const fetchSalesData = async (startDate, endDate) => {
    try {
      const response = await axios.get("http://localhost:8084/api/sales/monthly-category", {
        params: {
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      const data = response.data || []; // Ensure data is an array

      // Extract unique categories from data
      const uniqueCategories = [...new Set(data.map((item) => item.category_name))];
      setCategories(uniqueCategories);

      // Group data by month and category
      const groupedData = data.reduce((acc, item) => {
        const month = format(new Date(item.sale_month), 'MMMM yyyy'+543, { locale: th });
        if (!acc[month]) {
          acc[month] = {};
        }
        acc[month][item.category_name] = {
          quantity: item.total_quantity,
          sales: item.total_sales,
          profit: item.total_profit,
        };
        return acc;
      }, {});
      setSalesData(groupedData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setSalesData([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    // Fetch initial data for the date range on component load
    fetchSalesData(dateRange[0].startDate, dateRange[0].endDate);
  }, []);

  const handleDateChange = (range) => {
    setDateRange([range.selection]);
  };

  const applyDateRange = () => {
    // Trigger fetch only when date range is confirmed
    fetchSalesData(dateRange[0].startDate, dateRange[0].endDate);
    setShowPicker(false); // Close the picker after confirmation
  };

  const categoryTotals = categories.reduce((totals, category) => {
    totals[category] = Object.values(salesData).reduce(
      (sum, data) => sum + (data[category]?.[displayMode] || 0),
      0
    );
    return totals;
  }, {});

  return (
    <div>
      <Navigation />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-4">ยอดขายตามหมวดรายเดือน</h1>

        {/* Display Mode Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setDisplayMode("quantity")}
            className={`px-4 py-2 rounded ${displayMode === "quantity" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            จำนวนที่ขาย
          </button>
          <button
            onClick={() => setDisplayMode("sales")}
            className={`px-4 py-2 rounded ${displayMode === "sales" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            ยอดขายรวม
          </button>
          <button
            onClick={() => setDisplayMode("profit")}
            className={`px-4 py-2 rounded ${displayMode === "profit" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            กำไรสุทธิ
          </button>
        </div>

        {/* Date Picker Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="border border-gray-300 px-4 py-2 rounded"
          >
            {`${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`}
          </button>
        </div>

        {/* Date Picker with Apply and Cancel */}
        {showPicker && (
          <div className="relative z-10">
            <DateRange
              editableDateInputs={true}
              onChange={handleDateChange}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              locale={th}
              minDate={new Date("2022-01-01")} // Starting year
              maxDate={new Date()} // Current date
              showMonthAndYearPickers={true} // Allow month and year selection
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

        {/* Sales Data Table */}
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="border-b">
              <th className="border-r">เดือน</th>
              {categories.map((category) => (
                <th key={category}>{category}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(salesData).map(([month, data]) => (
              <tr key={month} className="border-b">
                <td className="p-2 border-r">{month}</td>
                {categories.map((category) => (
                  <td key={category} className="p-2">
                    {new Intl.NumberFormat("th-TH").format(data[category]?.[displayMode] || 0)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Totals Row */}
            <tr className="font-bold bg-gray-100 p-2">
              <td>รวม</td>
              {categories.map((category) => (
                <td key={category}>
                  {new Intl.NumberFormat("th-TH").format(categoryTotals[category] || 0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
