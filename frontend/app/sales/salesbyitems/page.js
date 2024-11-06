"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowUpIcon } from "@heroicons/react/solid";
import Navigation from '../../../components/Navigation';
import { formatDateToThai } from '../../utils/dateUtils';

export default function SalesByItem() {
  const [sales, setSales] = useState([]);
  const [offset, setOffset] = useState(0);
  const [pageSize] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const fetchSales = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.get("http://localhost:8084/api/sales/items", {
        params: { offset, pageSize }
      });

      const filteredSales = response.data;
      setSales((prevSales) => [...prevSales, ...filteredSales]);
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
    <div>
      <Navigation />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-4">Sales by Item</h1>
        <table className="min-w-full bg-white border border-spacing-0.5 p-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">วันที่</th>
              <th className="p-2 text-left">สินค้า</th>
              <th className="p-2 text-left">จำนวน</th>
              <th className="p-2 text-left">ราคา</th>
              <th className="p-2 text-left">ต้นทุน</th>
              <th className="p-2 text-left">ส่วนลด</th>
              <th className="p-2 text-left">การจ่ายเงิน</th>
              <th className="p-2 text-left">หมวดหมู่</th>
              <th className="p-2 text-left">ร้านค้า</th>
              <th className="p-2 text-left">เลขที่ใบเสร็จรับเงิน</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => {
              const isExpanded = expandedRows[index];
              const items = sale.item_name ? sale.item_name.split(",") : ["No Items"];

              return (
                <tr key={`${sale.receipt_number}-${index}`} className="border-b">
                  <td className="p-2">{formatDateToThai(new Date(sale.receipt_date), "วัน dd เดือน พ.ศ. HH:MM")}</td>
                  <td className="p-2">
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ease-in-out`}
                      style={{
                        maxHeight: isExpanded ? '300px' : '48px', 
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
                  <td className="p-2">{sale.quantity}</td>
                  <td className="p-2">{new Intl.NumberFormat('th-TH').format(sale.total_sales)}</td>
                  <td className="p-2">{new Intl.NumberFormat('th-TH').format(sale.total_cost)}</td>
                  <td className="p-2">{sale.total_discount}</td>
                  <td className="p-2">{sale.payment_names}</td>
                  <td className="p-2">{sale.category_name}</td>
                  <td className="p-2">{sale.store_name}</td>
                  <td className="p-2">{sale.receipt_number}</td>
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

