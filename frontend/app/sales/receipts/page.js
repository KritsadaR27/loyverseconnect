"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from '../../../components/Navigation';
import { formatDateToThai, addDaysToDate } from '../../utils/dateUtils';


export default function Receipts() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get("http://localhost:8084/api/receipts"); 
        setReceipts(response.data);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-4">Receipts List</h1>
        <table className="min-w-full bg-white border border-spacing-0.5  p-10">
          <thead>
            <tr>
              <th>Receipt Date</th>
              <th>Receipt Number</th>
              <th>Total Money</th>
              <th>รายการสินค้า</th>
              <th>Store Name</th>
              <th>Payments</th>
              <th>Status</th>
              <th>Total Discount</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt, index) => (
            <tr key={`${receipt.receipt_number}-${index}`} className='border-b'>
                <td>{formatDateToThai(new Date(receipt.receipt_date),"วัน dd เดือน พ.ศ.")}</td>
                <td>{receipt.receipt_number}</td>
                <td>{receipt.total_money}</td>
                <td>
                    {receipt.line_items_summary
                        ? receipt.line_items_summary.split(',').map((item, index) => (
                            <div key={index}>{item.trim()}</div> // แสดงแต่ละรายการในบรรทัดใหม่
                        ))
                        : "No Items"}
                </td>
                <td>{receipt.store_name}</td>
                <td>{receipt.cancelled_at ? "Cancelled" : "Sold"}</td>
                <td>{receipt.total_discount}</td>
            </tr>
            ))}
            </tbody>

        </table>
      </div>
    </div>
  );
}

