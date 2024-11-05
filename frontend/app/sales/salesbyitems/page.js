"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from '../../../components/Navigation';
import { formatDateToThai } from '../../utils/dateUtils';

export default function SalesByItem() {
  const [sales, setSales] = useState([]);
 
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get("http://localhost:8084/api/sales/items");
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales by item:", error);
      }
    };

    fetchSales();
  }, []);

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
              {sales.map((sale) => (
                <tr key={sale.receipt_number + sale.item_name} className="hover:bg-gray-50">
                <td>{formatDateToThai(new Date(sale.receipt_date))}</td>
                  <td className="px-4 py-2 border-b">{sale.item_name}</td>
                  <td className="px-4 py-2 border-b">{sale.quantity}</td>
                  <td className="px-4 py-2 border-b">{sale.price}</td>
                  <td className="px-4 py-2 border-b">{sale.cost}</td>
                  <td className="px-4 py-2 border-b">{sale.total_discount}</td>
                  <td className="px-4 py-2 border-b">
                    {sale.payments ? sale.payments.map(p => p.name).join(", ") : "No Payments"}
                  </td>
                  <td className="px-4 py-2 border-b">{sale.category_name}</td>
                  <td className="px-4 py-2 border-b">{sale.store_name}</td>
                  <td className="px-4 py-2 border-b">{sale.receipt_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
