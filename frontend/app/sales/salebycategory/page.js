"use client";
import React, { useState, useEffect } from "react";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import MonthlyCategorySalesActionBar from "./components/MonthlyCategorySalesActionBar";
import MonthlyCategorySalesTable from "./components/MonthlyCategorySalesTable";
import { fetchMonthlyCategorySales } from "../../api/salesService";
import { th } from "date-fns/locale"; // สำหรับแสดงภาษาไทย
import { format } from 'date-fns';

export default function MonthlyCategorySales() {
  const [salesData, setSalesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [displayMode, setDisplayMode] = useState("quantity");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2024-01-01T14:00:00Z"),
      endDate: new Date("2024-12-31T14:00:00Z"),
      key: "selection",
    },
  ]);
  const [showPicker, setShowPicker] = useState(false);

  const fetchSalesData = async (startDate, endDate) => {
    try {
      const data = await fetchMonthlyCategorySales(startDate, endDate);
      const uniqueCategories = [...new Set(data.map((item) => item.category_name))];
      setCategories(uniqueCategories);

      const groupedData = data.reduce((acc, item) => {
        const saleMonth = new Date(item.sale_month);
        const buddhistYear = saleMonth.getFullYear() + 543;
        const month = format(saleMonth, `MMMM ${buddhistYear}`, { locale: th });

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
    fetchSalesData(dateRange[0].startDate, dateRange[0].endDate);
  }, []);

  const applyDateRange = () => {
    fetchSalesData(dateRange[0].startDate, dateRange[0].endDate);
    setShowPicker(false);
  };

  return (
    <SidebarLayout
      headerTitle="ยอดขายตามหมวดรายเดือน"
      actionBar={
        <MonthlyCategorySalesActionBar
          dateRange={dateRange}
          setDateRange={setDateRange}
          showPicker={showPicker}
          setShowPicker={setShowPicker}
          applyDateRange={applyDateRange}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
        />
      }
    >
      <MonthlyCategorySalesTable
        salesData={salesData}
        categories={categories}
        displayMode={displayMode}
      />
    </SidebarLayout>
  );
}
