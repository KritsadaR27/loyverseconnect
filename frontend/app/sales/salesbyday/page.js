"use client";
import React, { useState, useEffect } from "react";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import SalesByDayActionBar from "./components/SalesByDayActionBar";
import SalesByDayTable from "./components/SalesByDayTable";
import { fetchSalesByDay } from "../../api/salesService";

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
    fetchSalesByDay(startDate, endDate).then(data => {
      const pivotedData = transformSalesData(data);
      setPivotData(pivotedData);
    });
    setShowPicker(false); // ปิด picker หลังจากเลือก preset
  };

  const applyDateRange = () => {
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setHours(23, 59, 59, 999); // ปรับเวลา endDate ให้ครอบคลุมถึงสิ้นวัน
    fetchSalesByDay(dateRange[0].startDate, adjustedEndDate).then(data => {
      const pivotedData = transformSalesData(data);
      setPivotData(pivotedData);
    });
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
    <SidebarLayout
      headerTitle="Sales by Day"
      actionBar={
        <SalesByDayActionBar
          dateRange={dateRange}
          setDateRange={setDateRange}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          handlePresetClick={handlePresetClick}
          applyDateRange={applyDateRange}
        />
      }
    >
      <SalesByDayTable pivotData={pivotData} />
    </SidebarLayout>
  );
}
