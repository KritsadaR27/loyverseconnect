"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsStockData } from '../../utils/api';
import { ChevronDownIcon, ChevronUpIcon, LightningBoltIcon } from '@heroicons/react/solid';

const TABS = [
    { label: 'สั่งของลุงรวย', key: 'order-lung-ruay' },
    { label: 'สั่งของอื่นๆ', key: 'order-others' }
];

const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const CreatePO = () => {
    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [collapsed, setCollapsed] = useState({});
    const [defaultOrderDate, setDefaultOrderDate] = useState('');

    useEffect(() => {
        const loadItems = async () => {
            const fetchedItems = await fetchItemsStockData(); // เรียกใช้ฟังก์ชันที่ถูกต้อง
            if (fetchedItems) {
                const filteredItems = fetchedItems.filter(item => 
                    ["จัมโบ้", "หมูลุงรวย", "ลูกชิ้น"].includes(item.supplier_name)
                );
                const grouped = groupItemsBySupplier(filteredItems);
                setGroupedItems(grouped);
            }
        };

        loadItems();
        const now = new Date();
        now.setDate(now.getDate() + 1);
        setDefaultOrderDate(formatDate(now)); // ใช้ฟังก์ชันที่ประกาศไว้
    }, []);

    const groupItemsBySupplier = (items) => {
        return items.reduce((acc, item) => {
            const supplier = item.supplier_name;
            if (!acc[supplier]) {
                acc[supplier] = [];
            }
            acc[supplier].push(item);
            return acc;
        }, {});
    };

    const toggleCollapse = (supplier) => {
        setCollapsed((prev) => ({
            ...prev,
            [supplier]: !prev[supplier]
        }));
    };

    const renderItems = (supplier, items) => (
        <div className="mb-8 bg-white shadow-md rounded-lg p-6 w-full mx-auto">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCollapse(supplier)}>
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">{supplier}</h2>
                <button className="bg-transparent text-gray-800">
                    {collapsed[supplier] ? <ChevronUpIcon className="h-6 w-6" /> : <ChevronDownIcon className="h-6 w-6" />}
                </button>
            </div>
            {!collapsed[supplier] && (
                <div>
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="py-2 text-left text-gray-600 font-medium">ชื่อสินค้า</th>
                                <th className="py-2 text-left text-gray-600 font-medium">สต๊อก</th>
                                <th className="py-2 text-left text-gray-600 font-medium">จำนวนที่ต้องการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.item_id} className="border-b">
                                    <td className="py-2 text-gray-900">{item.item_name}</td>
                                    <td className="py-2 text-gray-600">{item.in_stock}</td>
                                    <td className="py-2 text-gray-600">
                                        <input
                                            type="number"
                                            className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-200 flex flex-col items-stretch p-0 m-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center bg-green-700 p-4 shadow-lg">
                สร้างใบสั่งซื้อ
            </h1>
            <div className="mb-5 w-full max-w-screen-lg text-center mx-auto">
                <span className="text-gray-700 font-medium">สั่งเพื่อรับวันที่:</span>
                <input 
                    type="text"
                    value={defaultOrderDate} 
                    readOnly 
                    className="ml-3 p-2 border rounded bg-white text-gray-700 mt-2 md:mt-0 shadow-md"
                />
            </div>
            <div className="flex mb-5 w-full max-w-screen-lg justify-center flex-wrap">
                {TABS.map(tab => (
                    <button 
                        key={tab.key} 
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 px-3 py-2 text-center rounded-t-lg border-b-4 m-1 ${activeTab === tab.key ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-700 border-transparent'} transition duration-200`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="w-full max-w-screen-lg mx-auto">
                {Object.keys(groupedItems).map(supplier => (
                    <div key={supplier}>
                        {renderItems(supplier, groupedItems[supplier])}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreatePO;
