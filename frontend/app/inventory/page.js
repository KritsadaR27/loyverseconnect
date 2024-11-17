"use client";

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import  Sidebar from "../../components/Sidebar";
import  ActionBar from "./components/ActionBar";


const ItemStockView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [storeStocks, setStoreStocks] = useState({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [tableHeight, setTableHeight] = useState(0);

    useEffect(() => {
        const calculateHeight = () => {
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const viewportHeight = window.innerHeight;
            setTableHeight(viewportHeight - headerHeight - 20); // Adjust with padding/margin if needed
        };

        // Initial calculation
        calculateHeight();

        // Recalculate on window resize
        window.addEventListener('resize', calculateHeight);
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

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
                    Cell: ({ row }) => {
                        const storeStock = storeStocks[row.original.item_id]?.find(
                            (store) => store.store_name.replace("ลุงรวย สาขา", "") === storeName
                        );
                        return storeStock ? storeStock.in_stock : "0"; // Plain content
                    },
                    getCellProps: () => ({
                        className: `p-1.5 border-b text-center ${
                            index % 2 === 0 ? "bg-green-100" : "bg-yellow-100"
                        }`,
                    }),
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
        <div className="flex h-screen">
        {/* Sidebar */}
            <Sidebar className="flex-shrink-0" />
            <div className="flex-1 flex flex-col " >

                <div className="h-lvh bg-white box-shadow rounded flex-1 flex-col overflow-y-hidden ">
                    <header  className=" shadow-sm p-3">
                        <h1 className=" font-bold">สต็อกสินค้า</h1>
                        <ActionBar />
                    </header>
                    <div 
                    className="flex-1 overflow-y-auto p-y-4 overflow-y-auto  border border-gray-200 "
                    style={{ height: `${tableHeight}px` }} // Dynamically set the height
                   
                    >
                        <table {...getTableProps()} className=" bg-white border border-gray-200  rounded w-full">
                            <thead className="bg-gray-100 shadow-lg">
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column, index) => (
                                            <th
                                                {...column.getHeaderProps()}
                                                className={`p-2 border-b font-semibold text-gray-700 text-left bg-gray-100 sticky top-0 z-20`}
                                                // Adding sticky header styles
                                            >
                                                {column.render("Header")}
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
                                                className={`p-1.5 border-b text-left 
                                                    ${index === 0 ? 'sticky left-0 w-[150px] bg-white z-10' : ''}  // Freeze first cell (ชื่อสินค้า)
                                                    ${index === 1 ? 'sticky left-[150px] w-[100px] bg-white text-center z-10' : ''} // Freeze and size จำนวนรวม
                                                    ${index > 1 ? 'min-w-[80px] text-center ' : ''} // Store-specific columns
                                                `}
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
        </div>
    );
};

export default ItemStockView;
