"use client";

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import Navigation from '../../components/Navigation';

const ItemStockView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [storeStocks, setStoreStocks] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchStoreStock = async (itemIDs) => {
        try {
            const requests = itemIDs.map(itemID =>
                axios.get(`http://localhost:8082/api/item-stock/store`, {
                    params: { item_id: itemID }
                })
            );
            const responses = await Promise.all(requests);
            responses.forEach((response, index) => {
                const itemID = itemIDs[index];
                setStoreStocks((prev) => ({ ...prev, [itemID]: response.data }));
            });
            console.log("Fetched store stocks:", storeStocks);
        } catch (error) {
            console.error("Error loading store stock data:", error);
        }
    };

    useEffect(() => {
        const fetchItemStockData = async () => {
            try {
                const response = await axios.get('http://localhost:8082/api/item-stock');
                const groupedItems = response.data.reduce((acc, item) => {
                    const existingItem = acc.find((i) => i.item_id === item.item_id);
                    if (existingItem) {
                        existingItem.in_stock += item.in_stock;
                    } else {
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
    }, []);

    const toggleExpandAll = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            const itemIDs = items.map(item => item.item_id);
            fetchStoreStock(itemIDs);
        }
    };

    const columns = useMemo(() => {
        const baseColumns = [
            { Header: "ชื่อสินค้า", accessor: "item_name", className: "text-left" },
            {
                Header: (
                    <div className="flex justify-between items-center">
                        <span>จำนวนรวม</span>
                        <button
                            onClick={toggleExpandAll}
                            className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                        >
                            {isExpanded ? '←' : '→'}
                        </button>
                    </div>
                ),
                accessor: "in_stock",
                className: "text-left",
            },
            { Header: "ราคาขาย", accessor: "selling_price", className: "text-left", Cell: ({ value }) => `฿${value}` },
            { Header: "ต้นทุน", accessor: "cost", className: "text-left", Cell: ({ value }) => `฿${value}` },
            {
                Header: "มูลค่าขาย",
                accessor: "value",
                className: "text-left",
                Cell: ({ row }) => `฿${row.original.selling_price * row.original.in_stock}`
            },
            { Header: "หมวดหมู่", accessor: "category_name", className: "text-left" },
            { Header: "ซัพพลายเออร์", accessor: "supplier_name", className: "text-left", Cell: ({ value }) => value || 'ไม่ทราบ' },
        ];

        const storeColumns = [];
        if (isExpanded) {
            const uniqueStoreNames = new Set(
                Object.values(storeStocks).flatMap(stores => 
                    Array.isArray(stores) 
                        ? stores.map(store => store.store_name.replace("ลุงรวย สาขา", ""))
                        : []
                )
            );

            uniqueStoreNames.forEach((storeName, index) => {
                storeColumns.push({
                    Header: <span className="whitespace-nowrap">{storeName}</span>, // Prevent line breaks
                    accessor: `store_stock_${index}`,
                    className: "text-center",
                    Cell: ({ row }) => {
                        const storeStock = storeStocks[row.original.item_id]?.find(store => store.store_name.replace("ลุงรวย สาขา", "") === storeName);
                        return storeStock ? (
                            <div
                                className={`text-center ${index % 2 === 0 ? 'bg-green-100' : 'bg-yellow-100'} p-0.5`}
                            >
                                {storeStock.in_stock}
                            </div>
                        ) : null;
                    }
                });
            });
        }

        return [...baseColumns.slice(0, 2), ...storeColumns, ...baseColumns.slice(2)];
    }, [isExpanded, storeStocks, items]);

    const data = useMemo(() => items, [items]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

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
                        <table {...getTableProps()} className="min-w-[98vw] bg-white border border-gray-200 shadow-md rounded">
                            <thead className="bg-gray-100">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column, index) => (
                                            <th
                                                {...column.getHeaderProps()}
                                                className={`p-1 border-b font-semibold text-gray-700 text-left 
                                                    ${index === 0 ? 'sticky left-0 bg-gray-100' : ''}  // Freeze first column (ชื่อสินค้า)
                                                    ${index === 1 ? 'sticky left-[100px] bg-gray-100 w-16 text-center' : ''} // Freeze and size จำนวนรวม`}
                                            >
                                                {column.render('Header')}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()} className="hover:bg-gray-50 transition">
                                            {row.cells.map((cell, index) => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    className={`p-0.5 border-b text-left 
                                                        ${index === 0 ? 'sticky left-0 bg-white' : ''}  // Freeze first cell (ชื่อสินค้า)
                                                        ${index === 1 ? 'sticky left-[100px] bg-white w-16 text-center' : ''} // Freeze and size จำนวนรวม`}
                                                >
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

            </div>
        </div>
    );
};

export default ItemStockView;
