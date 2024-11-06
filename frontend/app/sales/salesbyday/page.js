"use client";
import React, { useState } from "react";
import axios from "axios";
import Navigation from "../../../components/Navigation";
import { formatDateToThai } from "../../utils/dateUtils";

export default function SalesByDay() {
  const [pivotData, setPivotData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSalesByDay = async () => {
    try {
      // Convert dates to ISO format before sending to backend
      const response = await axios.get("http://localhost:8084/api/sales/days", {
        params: {
          startDate: new Date(`${startDate}T00:00:00+07:00`).toISOString(),
          endDate: new Date(`${endDate}T23:59:59+07:00`).toISOString(),
        },
      });
      const salesData = response.data;
      const pivotedData = transformSalesData(salesData);
      setPivotData(pivotedData);
    } catch (error) {
      console.error("Error fetching sales by day:", error);
    }
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
        <div className="mb-4">
          <label className="mr-2">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <label className="ml-4 mr-2">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={fetchSalesByDay}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Fetch Sales
          </button>
        </div>
        <table className="min-w-full bg-white border-black table-fixed">
          <thead>
            <tr>
              <th className="border-black border">Item Name</th>
              {pivotData.dates &&
                pivotData.dates.map((date) => (
                  <th key={date} className="border-black border">
                    {formatDateToThai(new Date(date), "วัน dd/mm/พ.ศ.")}
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
