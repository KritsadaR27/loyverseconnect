"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline"; // เปลี่ยนการนำ��ข้าไอคอนให้ถูกต้อง
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import SalesByItemActionBar from "./components/SalesByItemActionBar";
import SalesByItemTable from "./components/SalesByItemTable";
import { fetchSalesByItem } from '../../api/salesService';

export default function SalesByItem() {
  const [sales, setSales] = useState([]);
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [filterText, setFilterText] = useState("");

  const fetchSales = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await fetchSalesByItem(offset, pageSize);
      setSales((prevSales) => [...prevSales, ...data]);
      setOffset((prevOffset) => prevOffset + pageSize);
    } catch (error) {
      console.error("Error fetching sales by item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
        fetchSales();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, isLoading]);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleExpandRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <SidebarLayout
      headerTitle="Sales by Item"
      actionBar={
        <SalesByItemActionBar
          filterText={filterText}
          setFilterText={setFilterText}
        />
      }
    >
      <div  >
        <SalesByItemTable
          sales={sales}
          expandedRows={expandedRows}
          toggleExpandRow={toggleExpandRow}
        />
        {isLoading && <p className="text-center">Loading...</p>}

        {showBackToTop && (
          <button
            onClick={handleBackToTop}
            className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
          >
            <ArrowUpIcon className="h-5 w-5 mr-1" />
            เลื่อนกลับไป บนสุด
          </button>
        )}
      </div>
    </SidebarLayout>
  );
}

