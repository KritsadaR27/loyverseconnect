"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline"; // เปลี่ยนการนำเข้าไอคอนให้ถูกต้อง
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import ReceiptsActionBar from "./components/ReceiptsActionBar"; // นำเข้า ReceiptsActionBar
import ReceiptsTable from "./components/ReceiptsTable"; // นำเข้า ReceiptsTable
import { fetchReceipts, fetchMasterData, groupDataByDateAndStore } from './../../api/receiptService';


export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [groupedReceipts, setGroupedReceipts] = useState({});
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Define the state
  const [filterText, setFilterText] = useState("");
  const [stores, setStores] = useState([]); // เพิ่ม state สำหรับ stores
  const [selectedStores, setSelectedStores] = useState([]); // เพิ่ม state สำหรับ selectedStores
  const [employees, setEmployees] = useState([]); // เพิ่ม state สำหรับ employees
  const [selectedEmployees, setSelectedEmployees] = useState([]); // เพิ่ม state สำหรับ selectedEmployees

  const loadReceipts = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const data = await fetchReceipts(offset, pageSize);
      const currentDate = new Date();
      const filteredReceipts = data.filter(receipt =>
        receipt.receipt_number && receipt.receipt_date &&
        new Date(receipt.receipt_date) <= currentDate
      );

      setReceipts((prevReceipts) => [...prevReceipts, ...filteredReceipts]);
      setOffset((prevOffset) => prevOffset + pageSize);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const masterData = await fetchMasterData();
      setStores(masterData.stores);
      // เพิ่มการตั้งค่าอื่นๆ ที่จำเป็น
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  useEffect(() => {
    loadReceipts();
    loadMasterData();
  }, []);

  useEffect(() => {
    const grouped = groupDataByDateAndStore(receipts);
    setGroupedReceipts(grouped);
  }, [receipts]);

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;

    if (scrollTop > 300) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }

    if (scrollHeight - scrollTop <= clientHeight + 500 && !isLoading) {
      loadReceipts();
    }
  }, [isLoading]);

  useEffect(() => {
    const debouncedHandleScroll = debounce(handleScroll, 200); // เพิ่ม debounce
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [handleScroll]);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRow = (index) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [index]: !prevExpandedRows[index],
    }));
  };

  const filterInventory = (text) => {
    setFilterText(text);
    // Add your filtering logic here
  };

  return (
    <SidebarLayout
      headerTitle="Receipts"
      actionBar={
        <ReceiptsActionBar
          filterText={filterText}
          setFilterText={setFilterText}
          stores={stores}
          selectedStores={selectedStores}
          setSelectedStores={setSelectedStores}
          employees={employees}
          selectedEmployees={selectedEmployees}
          setSelectedEmployees={setSelectedEmployees}
        />
      }
      onScroll={handleScroll}
    >
      <div>
        <ReceiptsTable
          items={receipts}
          selectedStores={selectedStores}
          selectedEmployees={selectedEmployees}
        />
        {showBackToTop && (
          <button
            onClick={handleBackToTop}
            className="fixed bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full shadow-lg"
          >
            <ArrowUpIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </SidebarLayout>
  );
}

// ฟังก์ชัน debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
