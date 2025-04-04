"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsStockData, saveItemOrderToAPI, fetchSuppliers, fetchSupplierCycles } from '../../utils/api';
import DatePicker from '../../../components/DatePicker';
import Tabs from '../../../components/Tabs';
import DraggableTable from '../../../components/DraggableTable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { formatDateToThai } from '../../utils/dateUtils';
import Navigation from '../../../components/Navigation';
import { calculateNextOrderDate } from '../../utils/calculateNextOrderDate';

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
// Helper function to get tomorrow's date in Thai timezone

const getOrderDate = () => {
    const now = new Date();
    const sixAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);

    if (now < sixAM) {
        // ก่อน 6 โมงเช้า
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
        // หลัง 6 โมงเช้า
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }
};



// Helper function to translate order cycle to Thai
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

const Page = () => {
       const [selectedDate, setSelectedDate] = useState(getOrderDate);

    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [suppliers, setSuppliers] = useState([]);
    const [collapsed, setCollapsed] = useState({});
    const [expandedItems, setExpandedItems] = useState({});
    const [itemOrder, setItemOrder] = useState({});
    const [suppliersOrderCycle, setSuppliersOrderCycle] = useState({});

    useEffect(() => {
         // ถ้ามีการเก็บค่า selectedDate ใน localStorage ให้นำออกเพื่อลดการแทรกแซงค่าเริ่มต้น
            const storedDate = localStorage.getItem("selectedDate");
            if (storedDate) {
                setSelectedDate(new Date(storedDate));
            }
            if (storedDate) {
                const date = new Date(storedDate);
                setSelectedDate(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
            }
        const loadItems = async () => {
            const fetchedItems = await fetchItemsStockData();
            const filteredItems = fetchedItems.filter(item => !EXCLUDED_STORES.includes(item.store_name));
            const grouped = groupItemsBySupplierWithStores(filteredItems, activeTab);
            setGroupedItems(grouped);

            const fetchedCycles = await fetchSupplierCycles();
            setSuppliersOrderCycle(fetchedCycles);
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
            let { item_name, in_stock, store_name, supplier_name } = item;

            if (EXCLUDED_STORES.includes(store_name)) return;

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

    const toggleExpandItem = (supplier, itemName) => {
        setExpandedItems((prev) => ({
            ...prev,
            [supplier]: {
                ...prev[supplier],
                [itemName]: !prev[supplier]?.[itemName],
            }
        }));
    };


    const handleInputChange = (supplier, itemName, field, value) => {
        setItemOrder((prevOrder) => ({
            ...prevOrder,
            [supplier]: prevOrder[supplier].map(item =>
                item.item_name === itemName ? { ...item, [field]: value } : item
            )
        }));
    };

    return (
        <div>
            <Navigation /> 
            <DndProvider backend={HTML5Backend}>
                <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-200 flex flex-col items-stretch p-0 m-0">
                    <h1 className="text-2xl font-bold text-white mb-8 text-center bg-green-700 p-4 shadow-lg">สร้างใบสั่งซื้อ</h1>
                    <DatePicker 
                        label="สั่งเพื่อรับวันที่:" 
                        selectedDate={selectedDate} 
                        setSelectedDate={setSelectedDate} 
                    />

                    <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

                    {Object.keys(groupedItems).map((supplier) => {
                        const supplierData = suppliers.find(s => s.name === supplier);
                        const nextOrderDate = supplierData && supplierData.order_cycle
                            ? calculateNextOrderDate(selectedDate, supplierData.order_cycle, supplierData.selected_days || [])
                            : selectedDate;

                        return (
                            <div key={supplier} className="mb-4">
                                <div className="flex justify-between items-center cursor-pointer bg-gray-300 p-4" onClick={() => toggleCollapse(supplier)}>
                                    <h2 className="text-lg font-semibold">
                                        {supplier}
                                    </h2>
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
                                        items={itemOrder[supplier] || groupedItems[supplier]} 
                                        onMoveItem={(from, to) => console.log(`Moved from ${from} to ${to}`)} 
                                        mapItemToColumns={(product) => [
                                            product.item_name,
                                            product.total_stock,
                                            <input
                                                type="number"
                                                value={product.reserve}
                                                onChange={(e) => handleInputChange(supplier, product.item_name, 'reserve', parseInt(e.target.value))}
                                                className="border px-2 py-1"
                                            />,
                                            calculateRecommendation(product),
                                            <input
                                                type="number"
                                                value={product.order_quantity}
                                                onChange={(e) => handleInputChange(supplier, product.item_name, 'order_quantity', parseInt(e.target.value))}
                                                className="border px-2 py-1"
                                            />
                                        ]}
                                        expandedItems={expandedItems && expandedItems[supplier] ? expandedItems[supplier] : {}}

                                        toggleExpand={(itemName) => toggleExpandItem(supplier, itemName)}
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
