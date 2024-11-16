"use client";

import React, { useState, useEffect } from 'react';


import { fetchItemsStockData } from '../../utils/api/inventory';
import { fetchSuppliers } from '../../utils/api/supplier';

import Tabs from '../../../components/Tabs';
import DraggableTable from '../../../components/DraggableTable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { formatDateToThai } from '../../utils/dateUtils';
import Navigation from '../../../components/Navigation';
import { calculateNextOrderDate } from '../../utils/calculateNextOrderDate';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios";
import { CalendarIcon } from '@heroicons/react/solid';




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

const getOrderDate = () => {
    const now = new Date();
    return now.getHours() < 6 ? now : new Date(now.setDate(now.getDate() + 1));
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

const CustomInput = ({ value, onClick, date, formatDateToThai }) => (
    <button className="example-custom-input" onClick={onClick}>
        {date ? formatDateToThai(date, "วัน dd เดือน พ.ศ.") : "เลือกวันที่"}
    </button>
);

const POEdit = () => {
    const [selectedDate, setSelectedDate] = useState(getOrderDate);
    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [suppliers, setSuppliers] = useState([]);
    const [collapsed, setCollapsed] = useState({});
    const [expandedItems, setExpandedItems] = useState({});
    const [itemOrder, setItemOrder] = useState({});
    const [storeStocks, setStoreStocks] = useState({});

    useEffect(() => {
        const loadItems = async () => {
            const fetchedItems = await fetchItemsStockData();
            const filteredItems = fetchedItems.filter(item => !EXCLUDED_STORES.includes(item.store_name));
            const grouped = groupItemsBySupplierWithStores(filteredItems, activeTab);
            setGroupedItems(grouped);

            const initialItemOrder = {};
            Object.keys(grouped).forEach(supplier => {
                initialItemOrder[supplier] = grouped[supplier].map(item => ({
                    item_name: item.item_name,
                    total_stock: item.total_stock,
                    reserve: 0,
                    order_quantity: 0
                }));
            });
            setItemOrder(initialItemOrder);
        };

        const loadSuppliers = async () => {
            const supplierData = await fetchSuppliers();
            setSuppliers(supplierData);
        };

        loadItems();
        loadSuppliers();
    }, [activeTab]);

    const groupItemsBySupplierWithStores = (items, activeTab) => {
        const result = {};
        items.forEach((item) => {
            let { item_id, item_name, in_stock, store_name, supplier_name } = item;

            if (!item_id || EXCLUDED_STORES.includes(store_name)) return;

            if (typeof supplier_name === 'object' && supplier_name.String) {
                supplier_name = supplier_name.String;
            }

            const isLungRuaySupplier = LUNG_RUAY_SUPPLIERS.includes(supplier_name);
            if ((activeTab === 'order-lung-ruay' && !isLungRuaySupplier) || 
                (activeTab === 'order-others' && isLungRuaySupplier)) {
                return;
            }

            const cleanedStoreName = store_name.replace("ลุงรวย สาขา", "");
            const supplierKey = supplier_name || "ไม่ทราบ";

            if (!result[supplierKey]) {
                result[supplierKey] = {};
            }

            if (!result[supplierKey][item_name]) {
                result[supplierKey][item_name] = {
                    item_id,
                    item_name,
                    total_stock: 0,
                    stores: {},
                    reserve: 0,
                    recommended_order_quantity: 0,
                    order_quantity: 0
                };
            }

            result[supplierKey][item_name].total_stock += in_stock;

            if (!result[supplierKey][item_name].stores[cleanedStoreName]) {
                result[supplierKey][item_name].stores[cleanedStoreName] = 0;
            }
            result[supplierKey][item_name].stores[cleanedStoreName] += in_stock;
        });

        Object.keys(result).forEach(supplier => {
            result[supplier] = Object.values(result[supplier]);
        });

        return result;
    };

    const toggleCollapse = (supplier) => {
        setCollapsed((prev) => ({
            ...prev,
            [supplier]: !prev[supplier]
        }));
    };

    const toggleExpand = async (itemID) => {
        if (!itemID) return;
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

    const handleInputChange = (supplier, itemName, field, value) => {
        setItemOrder((prevOrder) => ({
            ...prevOrder,
            [supplier]: (prevOrder[supplier] || []).map(item =>
                item.item_name === itemName ? { ...item, [field]: Number(value) || 0 } : item
            )
        }));
    };
    

    return (
        <div>
            <Navigation /> 
            <DndProvider backend={HTML5Backend}>
                <div className="min-h-screen bg-gradient-to-tl from-green-200 to-green-500 flex flex-col items-stretch p-0 m-0">
                    <header className="text-2xl font-bold text-white mb-8 text-center bg-green-700 p-4 shadow-lg">
                        
                        <div className="flex items-center">
                        <h1>สร้างใบสั่งซื้อ </h1> 
                        <label className="font-semibold"> รับวัน </label>
                        <DatePicker
                           selected={selectedDate}
                           onChange={(date) => setSelectedDate(date)}
                           customInput={<CustomInput date={selectedDate} formatDateToThai={formatDateToThai} />}
                           placeholderText="เลือกวันที่"
                        />


                    </div>
                    </header>
                   

                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

                    {Object.keys(groupedItems).map((supplier) => {
                        const supplierData = suppliers.find(s => s.name === supplier);
                        const nextOrderDate = supplierData && supplierData.order_cycle
                            ? calculateNextOrderDate(selectedDate, supplierData.order_cycle, supplierData.selected_days || [])
                            : selectedDate;

                        return (
                            <div key={supplier} className="mb-4">
                                <div className="flex justify-between items-center cursor-pointer bg-gray-300 p-4" onClick={() => toggleCollapse(supplier)}>
                                    <h2 className="text-lg font-semibold">{supplier}</h2>
                                    <p className="text-sm text-gray-600">
                                        สั่งรอบหน้าวันที่: {formatDateToThai(nextOrderDate)}
                                        (รอบสั่ง {getOrderCycleText(supplierData?.order_cycle)} {supplierData?.selected_days?.join(", ") || "N/A"})
                                    </p>
                                    <button className="text-gray-700">
                                        {collapsed[supplier] ? '▼' : '▲'}
                                    </button>
                                </div>

                                {!collapsed[supplier] && (
                                    <DraggableTable 
                                        headers={["ชื่อสินค้า", "สต๊อก", "เผื่อ", "จำนวนแนะนำ", "สั่งสินค้า"]} 
                                        items={groupedItems[supplier]} 
                                        onMoveItem={(from, to) => console.log(`Moved from ${from} to ${to}`)} 
                                        mapItemToColumns={(item) => [
                                            item.item_name,
                                            item.total_stock,
                                            <input
                                                type="number"
                                                value={itemOrder[supplier]?.find(i => i.item_name === item.item_name)?.reserve ?? ""}
                                                onChange={(e) => handleInputChange(supplier, item.item_name, 'reserve', e.target.value)}
                                                className="border px-2 py-1"
                                            />,
                                            calculateRecommendation(item),
                                            <input
                                                type="number"
                                                value={itemOrder[supplier]?.find(i => i.item_name === item.item_name)?.order_quantity ?? ""}
                                                onChange={(e) => handleInputChange(supplier, item.item_name, 'order_quantity', e.target.value)}
                                                className="border px-2 py-1"
                                            />
                                        ]}
                                        expandedItems={expandedItems}
                                        toggleExpand={(itemID) => toggleExpand(itemID)}
                                        expandedContent={(item) => (
                                            <div className="p-2 bg-yellow-100">
                                                <table className="bg-yellow-100">
                                                    <tbody>
                                                        {storeStocks[item.item_id]?.length > 0 ? (
                                                            storeStocks[item.item_id].map((stock) => (
                                                                <tr key={stock.store_name}>
                                                                    <td className="p-2">{stock.store_name}</td>
                                                                    <td className="p-2">{stock.in_stock}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="2" className="text-gray-500 text-center py-2">
                                                                    ไม่มีข้อมูลสต๊อก
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </DndProvider>
        </div>
    );
};

export default Page;
