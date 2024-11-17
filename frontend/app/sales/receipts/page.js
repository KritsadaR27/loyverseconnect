"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpIcon } from "@heroicons/react/solid";
import Navigation from '../../../components/Navigation';
import { formatDateToThai } from '../../utils/dateUtils';
import  Sidebar from "../../../components/Sidebar";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Define the state

  const fetchReceipts = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.get("http://localhost:8084/api/receipts", {
        params: { offset, pageSize }
      });

      const currentDate = new Date();
      const filteredReceipts = response.data.filter(receipt =>
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

  useEffect(() => {
    fetchReceipts();

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
        fetchReceipts();
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
    <div className="flex  min-h-screen">
            
            <Sidebar  sidebarCollapsed={sidebarCollapsed}
                        setSidebarCollapsed={setSidebarCollapsed} />
            
    {/* Main Content */}
      <div className={`transition-all duration-300 flex-1`}>
        <h1 className="text-2xl font-bold my-4">Receipts List</h1>
        <table className="min-w-full bg-white border border-spacing-0.5 p-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Receipt Date</th>
              <th className="p-2 text-left">Receipt Number</th>
              <th className="p-2 text-left">Total Money</th>
              <th className="p-2 text-left">รายการสินค้า</th>
              <th className="p-2 text-left">Store Name</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Total Discount</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt, index) => {
              const isExpanded = expandedRows[index];
              const items = receipt.line_items_summary ? receipt.line_items_summary.split(",") : ["No Items"];

              return (
                <tr key={`${receipt.receipt_number}-${index}`} className="border-b">
                  <td className="p-2">{formatDateToThai(new Date(receipt.receipt_date), "วัน dd เดือน พ.ศ. HH:MM")}</td>
                  <td className="p-2">{receipt.receipt_number}</td>
                  <td className="p-2">{new Intl.NumberFormat('th-TH').format(receipt.total_money)}</td>
                  <td className="p-2">
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ease-in-out`}
                      style={{
                        maxHeight: isExpanded ? '300px' : '48px', // สูงสุดที่ขยายได้ 300px
                      }}
                    >
                      {items.map((item, i) => (
                        <div key={i} className="truncate">{item.trim()}</div>
                      ))}
                    </div>
                    {items.length > 2 && (
                      <button
                        onClick={() => toggleExpandRow(index)}
                        className="text-blue-500 underline text-xs mt-1"
                      >
                        {isExpanded ? "ดูน้อยลง" : `ดู ทั้งหมด (${items.length})`}
                      </button>
                    )}
                  </td>
                  <td className="p-2">{receipt.store_name}</td>
                  <td className="p-2">{receipt.status}</td>
                  <td className="p-2">{receipt.total_discount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
    </div>
  );
}
