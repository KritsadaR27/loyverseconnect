"use client";

import { useEffect, useState } from 'react';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const response = await fetch('http://localhost:8080/api/sales'); // ตรวจสอบว่า API ตรงกับ backend ของคุณ
      if (response.ok) {
        const data = await response.json();
        setSalesData(data); // บันทึกข้อมูลลงใน state
      } else {
        console.error("Failed to fetch sales data");
      }
    };

    fetchSalesData(); // เรียกใช้ฟังก์ชันดึงข้อมูล
  }, []);

  const convertToThaiTime = (utcDate) => {
    const date = new Date(utcDate);
    return date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">รายงานยอดขาย</h1>
      <div className="overflow-x-auto w-full max-w-4xl">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-3 px-4 text-left">หมายเลขใบเสร็จ</th>
              <th className="py-3 px-4 text-left">วันที่</th>
              <th className="py-3 px-4 text-left">ยอดรวม</th>
              <th className="py-3 px-4 text-left">สาขา</th>
            </tr>
          </thead>
          <tbody>
            {salesData.length > 0 ? (
              salesData.map((sale) => (
                <tr key={sale.receipt_number} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-4">{sale.receipt_number}</td>
                  <td className="py-2 px-4">{convertToThaiTime(sale.receipt_date)}</td>
                  <td className="py-2 px-4">{sale.total_money.toLocaleString()}</td>
                  <td className="py-2 px-4">{sale.store_id}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500">
                  ไม่มีข้อมูลยอดขาย
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;
