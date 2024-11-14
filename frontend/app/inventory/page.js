"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../../components/Navigation';
import './ItemStockView.css';

const ItemStockView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [storeStocks, setStoreStocks] = useState({});
    const [updatedItems, setUpdatedItems] = useState({});

    const toggleExpand = async (itemID) => {
        if (expandedItems[itemID]) {
            setExpandedItems((prev) => ({ ...prev, [itemID]: false }));
        } else {
            try {
                const response = await axios.get(`http://localhost:8082/api/item-stock/store`, {
                    params: { item_id: itemID },
                });
                setStoreStocks((prev) => ({ ...prev, [itemID]: response.data }));
                setExpandedItems((prev) => ({ ...prev, [itemID]: true }));
            } catch (error) {
                console.error("Error loading store stock data:", error);
            }
        }
    };

    useEffect(() => {
        const fetchItemStockData = async () => {
            try {
                const response = await axios.get('http://localhost:8082/api/item-stock');
                
                // Group data by item_id to avoid duplicates
                const groupedItems = response.data.reduce((acc, item) => {
                    const existingItem = acc.find((i) => i.item_id === item.item_id);
                    if (existingItem) {
                        // If the item exists, aggregate the stock (or any other value if needed)
                        existingItem.in_stock += item.in_stock;
                    } else {
                        // Add new item if not already in the array
                        acc.push({ ...item });
                    }
                    return acc;
                }, []);
                
                setItems(groupedItems);
                setLoading(false);
            } catch (err) {
                setError('Error fetching item stock data');
                setLoading(false);
            }
        };

        fetchItemStockData();

        // WebSocket setup for real-time updates
        const socket = new WebSocket('ws://localhost:8082/ws/item-stock');
        socket.onmessage = (event) => {
            const updatedItem = JSON.parse(event.data);
            setItems((prevItems) =>
                prevItems.map((item) => 
                    item.item_id === updatedItem.item_id ? updatedItem : item
                )
            );
            setUpdatedItems((prev) => ({ ...prev, [updatedItem.item_id]: true }));
            setTimeout(() => {
                setUpdatedItems((prev) => ({ ...prev, [updatedItem.item_id]: false }));
            }, 2000);
        };

        return () => socket.close();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500 mt-10">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    return (
        <div>
            <Navigation />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold text-center mb-4">Item Stock View</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">ชื่อสินค้า</th>
                                <th className="py-2 px-4 border-b">จำนวนรวม</th>
                                <th className="py-2 px-4 border-b">ราคาขาย</th>
                                <th className="py-2 px-4 border-b">ต้นทุน</th>
                                <th className="py-2 px-4 border-b">มูลค่าขาย</th>
                                <th className="py-2 px-4 border-b">หมวดหมู่</th>
                                <th className="py-2 px-4 border-b">ซัพพลายเออร์</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <React.Fragment key={`${item.item_id}-${index}`}>
                                    <tr
                                        className={`hover:bg-gray-100 ${
                                            updatedItems[item.item_id] ? 'pulse' : ''
                                        }`}
                                    >
                                        <td className="py-2 px-4 border-b">{item.item_name}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            {item.in_stock}
                                            <span
                                                onClick={() => toggleExpand(item.item_id)}
                                                style={{ cursor: 'pointer', marginLeft: 8 }}
                                            >
                                                {expandedItems[item.item_id] ? '▲' : '▼'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b text-center">฿{item.selling_price}</td>
                                        <td className="py-2 px-4 border-b text-center">฿{item.cost}</td>
                                        <td className="py-2 px-4 border-b text-center">
                                            ฿{item.selling_price * item.in_stock}
                                        </td>
                                        <td className="py-2 px-4 border-b">{item.category_name}</td>
                                        <td className="py-2 px-4 border-b">{item.supplier_name || 'ไม่ทราบ'}</td>
                                    </tr>
                                    {expandedItems[item.item_id] && (
                                        <tr>
                                            <td colSpan="7" className="py-2 px-4">
                                                <div className="bg-gray-100 p-2 rounded">
                                                    <h3 className="font-bold mb-2">สต๊อกตามสาขา:</h3>
                                                    <table className="min-w-full bg-white border border-gray-200">
                                                        <thead>
                                                            <tr>
                                                                <th className="py-1 px-3 border-b">Store Name</th>
                                                                <th className="py-1 px-3 border-b">Stock</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {storeStocks[item.item_id]?.map((stock) => (
                                                                <tr key={stock.store_name}>
                                                                    <td className="py-1 px-3 border-b">
                                                                        {stock.store_name}
                                                                    </td>
                                                                    <td className="py-1 px-3 border-b">
                                                                        {stock.in_stock}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ItemStockView;
