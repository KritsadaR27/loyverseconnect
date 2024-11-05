"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navigation from '../../../components/Navigation';

export default function SalesByDay() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSalesByDay = async () => {
      try {
        const response = await axios.get("http://localhost:8084/api/sales/days");
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales by day:", error);
      }
    };

    fetchSalesByDay();
  }, []);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold my-4">Sales by Day</h1>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th>Sale Date</th>
              <th>Item Name</th>
              <th>Total Quantity</th>
              <th>Total Sales</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.sale_date + sale.item_name}>
                <td>{sale.sale_date}</td>
                <td>{sale.item_name}</td>
                <td>{sale.total_quantity}</td>
                <td>{sale.total_sales}</td>
                <td>{sale.total_profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
