"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsFromSuppliers } from '../../utils/api';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid'; // Import ลูกศร

const TABS = [
    { label: 'สั่งของลุงรวย', key: 'order-lung-ruay' },
    { label: 'สั่งของอื่นๆ', key: 'order-others' }
];

const getNextOrderDateForSupplier = (supplier, baseDate) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const base = new Date(baseDate);

    if (isNaN(base.getTime())) return ''; // ตรวจสอบว่าค่า base ไม่เป็น Invalid Date

    if (supplier === "จัมโบ้") {
        base.setDate(base.getDate() + 1);
        return `${base.toISOString().split('T')[0]} (${days[base.getDay()]})`;
    }
    
    if (supplier === "หมูลุงรวย") {
        const allowedDays = [2, 4, 6];
        while (!allowedDays.includes(base.getDay())) {
            base.setDate(base.getDate() + 1);
        }
        return `${base.toISOString().split('T')[0]} (${days[base.getDay()]})`;
    }

    return ''; 
};

const CreatePO = () => {
    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [collapsed, setCollapsed] = useState({});
    const [defaultOrderDate, setDefaultOrderDate] = useState('');

    useEffect(() => {
        const loadItems = async () => {
            const fetchedItems = await fetchItemsFromSuppliers();
            if (fetchedItems) {
                setGroupedItems(fetchedItems);
            }
        };
        loadItems();

        const now = new Date();
        let defaultDate;
        if (now.getHours() < 18) {
            defaultDate = now;
        } else {
            defaultDate = new Date(now);
            defaultDate.setDate(now.getDate() + 1);
        }

        if (!isNaN(defaultDate.getTime())) {
            setDefaultOrderDate(defaultDate.toISOString().split('T')[0]);
        } else {
            setDefaultOrderDate('');
        }
    }, []);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
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
                <>
                    <div className="mb-4">
                        <span className="text-gray-600 font-bold">จะสั่งครั้งหน้าวันที่:</span>
                        <span className="ml-2 text-gray-700 font-bold">
                            {getNextOrderDateForSupplier(supplier, defaultOrderDate)}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
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
                                    <tr key={item.id} className="border-b">
                                        <td className="py-2 text-gray-900">{item.name}</td>
                                        <td className="py-2 text-gray-600">[จำนวน]</td>
                                        <td className="py-2">
                                            <input 
                                                type="text" 
                                                placeholder="จำนวน" 
                                                className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
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
                    type="date" 
                    value={defaultOrderDate} 
                    readOnly 
                    className="ml-3 p-2 border rounded bg-white text-gray-700 mt-2 md:mt-0 shadow-md"
                />
            </div>
            <div className="flex mb-5 w-full max-w-screen-lg justify-center flex-wrap">
                {TABS.map(tab => (
                    <button 
                        key={tab.key} 
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex-1 px-3 py-2 text-center rounded-t-lg border-b-4 m-1 ${activeTab === tab.key ? 'bg-green-500 text-white border-green-600' : 'bg-gray-300 text-gray-700 border-transparent'} transition duration-200`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="w-full max-w-screen-lg mx-auto">
                {activeTab === 'order-lung-ruay' && (
                    <div>
                        {['จัมโบ้', 'หมูลุงรวย', 'ลูกชิ้น'].map((supplier) => 
                            renderItems(supplier, groupedItems[supplier] || [])
                        )}
                    </div>
                )}

                {activeTab === 'order-others' && (
                    <div>
                        <div className="mb-4">
                            <span className="text-gray-700 font-medium">วันที่รับของ:</span>
                            <input type="date" className="ml-3 p-2 border rounded bg-white mt-2 md:mt-0 shadow-md" />
                        </div>
                        {["อั่ว", "โคขุน", "ริบอาย"].map((supplier) =>
                            renderItems(supplier, groupedItems[supplier] || [])
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatePO;
