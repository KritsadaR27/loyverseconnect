"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from '../../../components/Navigation';
import { formatDateToThai } from '../../utils/dateUtils';

export default function SalesByItem() {
  const [sales, setSales] = useState([]);
  const [offset, setOffset] = useState(0); // เริ่ม offset ที่ 200
  const [pageSize] = useState(100); // โหลดทีละ 200 รายการ
  const [loading, setLoading] = useState(false); // สำหรับสถานะการโหลดข้อมูล
  const [showMore, setShowMore] = useState(true); // ควบคุมการแสดงปุ่ม "โหลดเพิ่มเติม"

  // ฟังก์ชันดึงข้อมูลเพิ่มเติม
  const fetchSales = async () => {
    if (loading) return; // หลีกเลี่ยงการเรียกซ้ำหากกำลังโหลดอยู่
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8084/api/sales/items", {
        params: { offset, pageSize } // ส่ง offset และ pageSize ไปที่ backend
      });

      // ถ้าข้อมูลที่ได้รับมาน้อยกว่า pageSize แสดงว่าไม่มีข้อมูลเพิ่มแล้ว
      if (response.data.length < pageSize) {
        setShowMore(false);
      }

      // เพิ่มข้อมูลใหม่เข้าไปใน sales
      setSales((prevSales) => [...prevSales, ...response.data]);

      // เพิ่ม offset สำหรับการโหลดครั้งถัดไป
      setOffset((prevOffset) => prevOffset + pageSize);
    } catch (error) {
      console.error("Error fetching sales by item:", error);
    } finally {
      setLoading(false);
    }
  };

  // เรียก fetchSales เมื่อโหลดครั้งแรก
  useEffect(() => {
    fetchSales();
  }, []);

  // เพิ่ม event listener สำหรับ Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !loading &&
        showMore
      ) {
        fetchSales(); // โหลดข้อมูลเพิ่มเติมเมื่อเลื่อนถึงด้านล่าง
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // ลบ event listener เมื่อ component ถูก unmount
  }, [loading, showMore]);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Sales by Item</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border-b">Receipt Date</th>
                <th className="px-4 py-2 border-b">Item Name</th>
                <th className="px-4 py-2 border-b">Quantity</th>
                <th className="px-4 py-2 border-b">Price</th>
                <th className="px-4 py-2 border-b">Cost</th>
                <th className="px-4 py-2 border-b">Total Discount</th>
                <th className="px-4 py-2 border-b">Payments</th>
                <th className="px-4 py-2 border-b">Category</th>
                <th className="px-4 py-2 border-b">Store Name</th>
                <th className="px-4 py-2 border-b">Receipt Number</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale.receipt_number + sale.item_name + index} className="hover:bg-gray-50">
                  <td>{formatDateToThai(new Date(sale.receipt_date), "dd/mm/yyyy HH:MM"  )}</td>
                  <td className="px-4 py-2 border-b">{sale.item_name}</td>
                  <td className="px-4 py-2 border-b">{sale.quantity}</td>
                  <td className="px-4 py-2 border-b"> 
                  {new Intl.NumberFormat('th-TH').format(sale.total_sales)}
                  </td>
                  <td className="px-4 py-2 border-b">{new Intl.NumberFormat('th-TH').format(sale.total_cost)}</td>
                  <td className="px-4 py-2 border-b">{sale.total_discount}</td>
                  <td className="px-4 py-2 border-b">{sale.payment_names}</td>
                  <td className="px-4 py-2 border-b">{sale.category_name}</td>
                  <td className="px-4 py-2 border-b">{sale.store_name}</td>
                  <td className="px-4 py-2 border-b">{sale.receipt_number}</td>
                </tr>
              ))}
            </tbody> 
          </table>
          {/* แสดงข้อความ "กำลังโหลด..." หรือปุ่ม "โหลดเพิ่มเติม" */}
          {loading && <p className="text-center my-4">กำลังโหลด...</p>}
          {!loading && showMore && (
            <button onClick={fetchSales} className="mt-4 mx-auto block px-4 py-2 bg-blue-500 text-white rounded-md">
              โหลดเพิ่มเติม
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
