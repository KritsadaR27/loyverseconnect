"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsStockData, fetchStoreStock, fetchSalesByDay } from '../../utils/api/inventory';
import { fetchSuppliers } from '../../utils/api/supplier';
import Tabs from '../../../components/Tabs';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import dynamic from 'next/dynamic';
import  Sidebar from "../../../components/Sidebar";

import { formatDateToThai } from '../../utils/dateUtils';
import Navigation from '../../../components/Navigation';
import CustomDateInput from '../components/CustomDateInput';
import { calculateNextOrderDate } from '../../utils/calculateNextOrderDate';
const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });
import 'react-datepicker/dist/react-datepicker.css';
import {  ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
const getOrderDate = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 0 && hour < 6) {
        return now; // ใช้วันนี้
    } else {
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1); // ใช้วันถัดไป
        return nextDay;
    }
};
const calculateSalesDates = (startDate, nextOrderDate) => {
    const days = [];
    let current = new Date(startDate);
    while (current < nextOrderDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1); // เพิ่มวันทีละวัน
    }
    return days;
};


const TABS = [
    { label: 'สั่งของลุงรวย', key: 'order-lung-ruay' },
    { label: 'สั่งของอื่นๆ', key: 'order-others' }
];

const EXCLUDED_STORES = ["ลุงรวย รถส่งของ", "สาขาอื่นๆ"];
const LUNG_RUAY_SUPPLIERS = ["จัมโบ้", "หมูลุงรวย", "ลูกชิ้น"];

const calculateRecommendation = (product) => {
    const reserve = product.reserve || 0;
    const remainingStock = product.total_stock - reserve - (product.sales ? product.sales.sat : 0) - (product.sales ? product.sales.sun : 0);
    return Math.ceil(Math.max(0, -remainingStock) / 10) * 10;
};


const getOrderCycleText = (value) => {
    switch(value) {
        case "daily": return "ทุกวัน";
        case "selectDays": return "เลือกวัน";
        case "exceptDays": return "ทุกวันยกเว้น";
        case "alternateMon": return "วันเว้นวันเริ่มวันจันทร์";
        case "alternateTue": return "วันเว้นวันเริ่มวันอังคาร";
        default: return "ไม่ได้กำหนด";
    }
};

const POEdit = () => {
    const [selectedDate, setSelectedDate] = useState(getOrderDate);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [groupedItems, setGroupedItems] = useState({});
    const [suppliers, setSuppliers] = useState([]);
    const [collapsed, setCollapsed] = useState({});
    const [salesData, setSalesData] = useState({});
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Define the state


    useEffect(() => {
          // ดึงข้อมูลยอดขาย
         
  
        const loadItems = async () => {
            const fetchedItems = await fetchItemsStockData();
            const filteredItems = fetchedItems.filter(item => !EXCLUDED_STORES.includes(item.store_name));
            const grouped = groupItemsBySupplier(filteredItems, activeTab);
            setGroupedItems(grouped);
        };

        const loadSuppliers = async () => {
            const supplierData = await fetchSuppliers();
            setSuppliers(supplierData);
        };

       

        loadItems();
        loadSuppliers();
        fetchSalesData();


      
        
    }, [activeTab, selectedDate]);

    

    const groupItemsBySupplier = (items, activeTab) => {
        const result = {};
    
        items.forEach((item) => {
            const { item_id, item_name, in_stock, store_name, supplier_name } = item;
    
            // ตรวจสอบว่าข้อมูล `item_id` มีค่า และร้านไม่อยู่ในรายการที่ต้องละเว้น
            if (!item_id || EXCLUDED_STORES.includes(store_name)) return;
    
            // ตรวจสอบว่า supplier เป็นของ "ลุงรวย" หรือไม่
            const isLungRuaySupplier = LUNG_RUAY_SUPPLIERS.includes(supplier_name);
            if ((activeTab === 'order-lung-ruay' && !isLungRuaySupplier) || 
                (activeTab === 'order-others' && isLungRuaySupplier)) return;
    
            // กำหนด key ของ supplier ถ้าไม่ทราบชื่อ supplier ให้ใช้ "ไม่ทราบ"
            const supplierKey = supplier_name || "ไม่ทราบ";
    
            // ถ้า result ไม่มี key ของ supplier นี้ ให้สร้าง array ใหม่
            if (!result[supplierKey]) {
                result[supplierKey] = [];
            }
    
            // ตรวจสอบว่ารายการนี้มีอยู่ใน array ของ supplier นี้หรือยัง
            const existingItem = result[supplierKey].find(existing => existing.item_id === item_id);
    
            if (existingItem) {
                // ถ้ามีอยู่แล้ว ให้บวกจำนวนสต๊อกเพิ่มเข้าไป
                existingItem.total_stock += in_stock;
            } else {
                // ถ้าไม่มี ให้สร้างรายการใหม่
                result[supplierKey].push({
                    item_id,
                    item_name,
                    total_stock: in_stock,
                    reserve: 0,
                    recommended_order_quantity: calculateRecommendation(item),
                    order_quantity: 0,
                    sales_by_day: salesData[item_id] || {} // เก็บข้อมูลยอดขายตามวันที่ในรูปแบบ object
                });
            }
        });
    
        return result;
    };
    

    const toggleCollapse = (supplier) => {
        setCollapsed((prev) => ({
            ...prev,
            [supplier]: !prev[supplier]
        }));
    };
// กำหนดฟังก์ชันเพื่อดึงข้อมูลยอดขาย
const daysBack = 7; // Set the number of days to look back for sales data

// Function to fetch sales data, now with nextOrderDate as an argument
const fetchSalesData = async (nextOrderDate) => {
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - daysBack); // Use daysBack constant or state variable

    const endDate = new Date(nextOrderDate);
    endDate.setDate(endDate.getDate() - daysBack); // Calculate endDate based on nextOrderDate

    const fetchedSalesData = await fetchSalesByDay(startDate, endDate);
    console.log("Fetched Sales Data:", fetchedSalesData); // Check fetched sales data
    setSalesData(fetchedSalesData);
};


// ฟังก์ชันเพื่อคำนวณวันที่แสดงยอดขายตั้งแต่ selectedDate - daysBack จนถึง nextOrderDate - daysBack
const calculateSalesDays = (selectedDate, nextOrderDate, daysBack = 7) => {
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - daysBack); // ลบ daysBack วันจาก selectedDate

    const endDate = new Date(nextOrderDate);
    endDate.setDate(endDate.getDate() - daysBack); // ลบ daysBack วันจาก nextOrderDate

    const days = [];
    let current = new Date(startDate);

    while (current <= endDate) { // รวม endDate ในการแสดงยอดขาย
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
};

const generateColumns = (nextOrderDate, daysBack = 7) => {
       
    const salesDays = calculateSalesDays(selectedDate, nextOrderDate, daysBack).map(date => ({
        headerName: formatDateToThai(date),
            field: `sales_${date.toISOString().split('T')[0]}`,
            valueGetter: (params) => params.data.sales_by_day?.[date.toISOString().split('T')[0]] || 0,
        }));

        return [
            { headerName: "ชื่อสินค้า", field: "item_name" },
            { headerName: "สต๊อก", field: "total_stock" },
            {
                headerName: "เผื่อ",
                field: "reserve",
                editable: true,
                cellRendererFramework: (params) => (
                    <input
                        type="number"
                        value={params.data.reserve}
                        onChange={(e) => handleInputChange(params.data.supplier_name, params.data.item_name, 'reserve', e.target.value)}
                        className="border px-2 py-1"
                    />
                )
            },
            ...salesDays,
            { headerName: "จำนวนแนะนำ", field: "recommended_order_quantity" },
            {
                headerName: "สั่งสินค้า",
                field: "order_quantity",
                editable: true,
                cellRendererFramework: (params) => (
                    <input
                        type="number"
                        value={params.data.order_quantity}
                        onChange={(e) => handleInputChange(params.data.supplier_name, params.data.item_name, 'order_quantity', e.target.value)}
                        className="border px-2 py-1"
                    />
                )
            }
        ];
    };


    return (
        <div className="flex  min-h-screen">
            
            <Sidebar  sidebarCollapsed={sidebarCollapsed}
                        setSidebarCollapsed={setSidebarCollapsed} />
            
 {/* Main Content */}
            <div
                className={`transition-all duration-300 flex-1`}
                >
                <div className="min-h-screen bg-gradient-to-tl from-green-200 to-green-500 ">                
                    <header className="text-2xl font-bold mb-8 text-center bg-gray-300 p-4 shadow-lg">
                        <div className="flex items-center">
                            <h1>สร้างใบสั่งซื้อ</h1>
                            <label className="font-semibold"> รับวัน </label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                customInput={
                                    <CustomDateInput
                                        date={selectedDate}
                                        formatDateToThai={formatDateToThai}
                                    />
                                }
                                placeholderText="เลือกวันที่"
                                className="bg-green-500 text-white border-none rounded-lg px-3 py-2"
                            />

                        </div>
                    </header>

                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

                    {Object.keys(groupedItems).map((supplier) => {
                        const supplierData = suppliers.find(s => s.supplier_name === supplier);
                        const nextOrderDate = supplierData && supplierData.order_cycle
                            ? calculateNextOrderDate(selectedDate, supplierData.order_cycle, supplierData.selected_days || [])
                            : selectedDate;

                            const currentColumns = generateColumns(nextOrderDate,7);

                        return (
                            <div key={supplier} className="mb-4">
                                <div
                                    className="flex justify-between items-center bg-gray-300 p-4 cursor-pointer"
                                    onClick={() => toggleCollapse(supplier)}
                                >
                                    <h2 className="text-lg font-semibold">{supplier}</h2>
                                    <p className="text-sm text-gray-600">
                                        สั่งรอบหน้าวันที่: {formatDateToThai(nextOrderDate)} 
                                        (รอบสั่ง {getOrderCycleText(supplierData?.order_cycle)} {supplierData?.selected_days?.join(", ") || "N/A"})
                                    </p>
                                    <button className="text-gray-700">
                                        {collapsed[supplier] ? (
                                            <ChevronDownIcon className="h-5 w-5" />
                                        ) : (
                                            <ChevronUpIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {!collapsed[supplier] && (
                                    <div className="ag-theme-alpine" style={{  width: '100%' }}>
                                        <AgGridReact
                                            rowData={groupedItems[supplier]}
                                            columnDefs={currentColumns}
                                            domLayout="autoHeight"
                                            groupDefaultExpanded={-1}
                                            rowSelection="single"
                                            suppressRowClickSelection={true}
                                            animateRows={true}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default POEdit;
