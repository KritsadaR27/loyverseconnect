"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsStockData } from '../../utils/api';
import { ChevronDownIcon, ChevronUpIcon, LightningBoltIcon } from '@heroicons/react/solid';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
const TABS = [
    { label: 'สั่งของลุงรวย', key: 'order-lung-ruay' },
    { label: 'สั่งของอื่นๆ', key: 'order-others' }
];
const ItemTypes = {
    ITEM: 'item',
};
const DraggableItem = ({ item, index, moveItem }) => {
    const [{ isDragging }, ref] = useDrag({
        type: ItemTypes.ITEM,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.ITEM,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveItem(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    // Add the class based on whether the item is being dragged or hovered
    const dropClass = isOver ? 'bg-blue-100' : '';

    // Ensure return statement is correctly positioned
    return (
        <tr 
            ref={node => ref(drop(node))} 
            className={`border-b grabme ${isDragging ? 'dragging' : ''} ${dropClass}` } 
            // style={{ cursor: 'grab' }} // เพิ่มที่นี่เพื่อให้แสดงเป็นมือหยิบ
        >
            <td className="py-2 text-gray-900">{item.item_name}</td>
            <td className="py-2 text-gray-600">{item.total_stock !== null ? item.total_stock : '[จำนวน]'}</td>
            <td className="py-2 text-gray-600">
                <input type="number" className="w-20 p-1 border rounded" />
            </td>
            <td className="py-2 text-gray-600">{item.sales.sat}</td>
            <td className="py-2 text-gray-600">{item.sales.sun}</td>
            <td className="py-2 text-gray-600">{}</td>
            <td className="py-2">
                <input type="number" className="w-20 p-1 border rounded" />
            </td>
        </tr>
    );
};


const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const getNextOrderDateForSupplier = (supplier, baseDate) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const base = new Date(baseDate);
    if (isNaN(base.getTime())) return '';

    if (supplier === "จัมโบ้") {
        base.setDate(base.getDate() + 1);
        return `วัน${days[base.getDay()]} ${formatDate(base)}`;
    }
    if (supplier === "หมูลุงรวย") {
        const allowedDays = [2, 4, 6];
        while (!allowedDays.includes(base.getDay())) {
            base.setDate(base.getDate() + 1);
        }
        return `วัน${days[base.getDay()]} ${formatDate(base)}`;
    }
    return '';
};

const groupItemsBySupplier = (items) => {
    const grouped = items.reduce((acc, item) => {
        const supplier = item.supplier_name;
        if (!acc[supplier]) {
            acc[supplier] = [];
        }
        acc[supplier].push(item);
        return acc;
    }, {});

    return grouped;
};
const sortItems = (items) => {
    return items.sort((a, b) => {
        // Ensure supplier_name is a string before using includes
        const supplierA = typeof a.supplier_name === 'string' ? a.supplier_name : '';
        const supplierB = typeof b.supplier_name === 'string' ? b.supplier_name : '';

        // Check if supplier_name contains "จัมโบ้"
        const isAJumbo = supplierA.includes("จัมโบ้");
        const isBJumbo = supplierB.includes("จัมโบ้");

        // Sort "จัมโบ้" to the top
        if (isAJumbo && !isBJumbo) return -1; // a comes before b
        if (!isAJumbo && isBJumbo) return 1;  // b comes before a

        // Check if item_name contains "ไส้กรอกหมู"
        const isASausage = a.item_name.includes("ไส้กรอกหมู");
        const isBSausage = b.item_name.includes("ไส้กรอกหมู");
        if (isASausage && !isBSausage) return -1;
        if (!isASausage && isBSausage) return 1;

        // Check if item_name contains "ไส้กรอกข้าว"
        const isARiceSausage = a.item_name.includes("ไส้กรอกข้าว");
        const isBRiceSausage = b.item_name.includes("ไส้กรอกข้าว");
        if (isARiceSausage && !isBRiceSausage) return -1;
        if (!isARiceSausage && isBRiceSausage) return 1;

        // Finally, sort alphabetically by item_name
        return a.item_name.localeCompare(b.item_name);
    });
};







const CreatePO = () => {
    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [collapsed, setCollapsed] = useState({});
    const [defaultOrderDate, setDefaultOrderDate] = useState('');
    const [reserveValues, setReserveValues] = useState({});
    const [desiredAmounts, setDesiredAmounts] = useState({});

    const moveItem = (fromIndex, toIndex, supplier) => {
        const updatedItems = [...groupedItems[supplier]].slice();
        const [movedItem] = updatedItems.splice(fromIndex, 1);
        updatedItems.splice(toIndex, 0, movedItem);
        setGroupedItems(prev => ({
            ...prev,
            [supplier]: updatedItems,
        }));
    };
    
    
    useEffect(() => {
        const loadItems = async () => {
            console.log("Loading items from API...");
        
            const fetchedItems = await fetchItemsStockData();
            console.log("Fetched items:", fetchedItems);
        
            if (fetchedItems) {
                const stockTotals = {};
        
                fetchedItems.forEach(item => {
                    const itemName = item.item_name;
                    const storeName = item.store_name;
        
                    if (storeName === "ลุงรวย รถส่งของ" || storeName === "สาขาอื่นๆ") {
                        return; // Skip unwanted stores
                    }
        
                    const supplierName = typeof item.supplier_name === 'object' && item.supplier_name.String
                        ? item.supplier_name.String
                        : item.supplier_name || 'ไม่ทราบ';
        
                    if (!stockTotals[itemName]) {
                        stockTotals[itemName] = {
                            item_name: itemName,
                            total_stock: 0,
                            supplier_name: supplierName,
                            sales: {
                                sat: 220,
                                sun: 100,
                                mon: 150,
                                tue: 250,
                            },
                        };
                    }
        
                    stockTotals[itemName].total_stock += item.in_stock;
                });
        
                const itemsWithStock = Object.values(stockTotals);
                const sortedItems = sortItems(itemsWithStock);
        
                console.log("Items with total stock data:", sortedItems);
        
                setGroupedItems(groupItemsBySupplier(sortedItems));
            }
        };
        
        loadItems();
        
    }, [activeTab]);
    
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };

    const toggleCollapse = (supplier) => {
        setCollapsed((prev) => ({
            ...prev,
            [supplier]: !prev[supplier]
        }));
    };

    // const calculateRecommendation = (item) => {
    //     const reserve = reserveValues[item.item_id] || item.reserve;
    //     const remainingStock = item.total_stock - reserve - item.sales.sat - item.sales.sun;
    //     return Math.ceil(Math.max(0, -remainingStock) / 10) * 10;
    // };

    // const setRecommendedAmounts = () => {
    //     const newDesiredAmounts = {};
    //     Object.keys(groupedItems).forEach((supplier) => {
    //         groupedItems[supplier].forEach((item) => {
    //             newDesiredAmounts[item.item_id] = calculateRecommendation(item) || 0;
    //         });
    //     });
    //     setDesiredAmounts(newDesiredAmounts);
    // };

    const renderItems = (supplier, items) => (
        <div className="mb-8 bg-white shadow-md rounded-lg p-6 w-full mx-auto">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCollapse(supplier)}>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">{supplier}</h2>
                <button className="bg-transparent text-gray-800">
                    {collapsed[supplier] ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
                </button>
            </div>
            {!collapsed[supplier] && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="py-2 text-left text-gray-600 font-medium">ชื่อสินค้า</th>
                                <th className="py-2 text-left text-gray-600 font-medium">สต๊อก</th>
                                <th className="py-2 text-left text-gray-600 font-medium">เผื่อ</th>
                                <th className="py-2 text-left text-gray-600 font-medium">ยอดขาย (เสาร์)</th>
                                <th className="py-2 text-left text-gray-600 font-medium">ยอดขาย (อาทิตย์)</th>
                                <th className="py-2 text-left text-gray-600 font-medium">แนะนำ</th>
                                <th className="py-2 text-left text-gray-600 font-medium">จำนวนที่ต้องการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <DraggableItem key={item.item_id} item={item} index={index} moveItem={(fromIndex, toIndex) => moveItem(fromIndex, toIndex, supplier)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
    
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-200 flex flex-col items-stretch p-0 m-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-green-700 p-4 shadow-lg">
                    สร้างใบสั่งซื้อ
                </h1>
                <div className="mb-5 w-full max-w-screen-lg text-center mx-auto">
                    <span className="text-gray-700 font-medium">สั่งเพื่อรับวันที่:</span>
                    <input type="text" value={defaultOrderDate} readOnly className="ml-3 p-2 border rounded bg-white text-gray-700 mt-2 md:mt-0 shadow-md" />
                </div>
                <div className="flex mb-5 w-full max-w-screen-lg justify-center flex-wrap">
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`flex-1 px-3 py-2 text-center rounded-t-lg border-b-4 m-1 ${activeTab === tab.key ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-700 border-transparent'} transition duration-200`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="w-full max-w-screen-lg mx-auto">
                    {activeTab === 'order-lung-ruay' ? (
                        <div>
                            {['จัมโบ้', 'หมูลุงรวย', 'ลูกชิ้น'].map((supplier, index) => (
                                <div key={index}>
                                    {renderItems(supplier, groupedItems[supplier] || [])}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                <span className="text-gray-700 font-medium">วันที่รับของ:</span>
                                <input type="text" value={defaultOrderDate} readOnly className="ml-3 p-2 border rounded bg-white text-gray-700 mt-2 md:mt-0 shadow-md" />
                            </div>
                            {["อั่ว", "โคขุน", "ริบอาย"].map((supplier, index) => (
                                <div key={index}>
                                    {renderItems(supplier, groupedItems[supplier] || [])}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DndProvider>
    );
};

export default CreatePO;
