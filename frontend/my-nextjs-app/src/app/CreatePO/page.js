"use client";

import React, { useState, useEffect } from 'react';
import { fetchItemsFromSuppliers } from '../../utils/api';

const TABS = [
    { label: 'สั่งของลุงรวย', key: 'order-lung-ruay' },
    { label: 'สั่งของอื่นๆ', key: 'order-others' }
];

const getNextOrderDateForSupplier = (supplier, baseDate) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const base = new Date(baseDate);
    
    if (supplier === "จัมโบ้") {
        // วันถัดไป
        base.setDate(base.getDate() + 1);
        return `${base.toISOString().split('T')[0]} (${days[base.getDay()]})`;
    }
    
    if (supplier === "หมูลุงรวย") {
        // หาวันถัดไปที่เป็น อังคาร, พฤหัสบดี, หรือ เสาร์
        const allowedDays = [2, 4, 6]; // 2 = อังคาร, 4 = พฤหัสบดี, 6 = เสาร์
        while (!allowedDays.includes(base.getDay())) {
            base.setDate(base.getDate() + 1);
        }
        return `${base.toISOString().split('T')[0]} (${days[base.getDay()]})`;
    }

    return ''; // สำหรับ supplier อื่นๆ ไม่ต้องคำนวณ
};

const CreatePO = () => {
    const [groupedItems, setGroupedItems] = useState({});
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    const [orderDate, setOrderDate] = useState({});
    const [defaultOrderDate, setDefaultOrderDate] = useState('');

    useEffect(() => {
        const loadItems = async () => {
            const fetchedItems = await fetchItemsFromSuppliers();
            if (fetchedItems) {
                setGroupedItems(fetchedItems);
            }
        };
        loadItems();

        // Set default date as today or tomorrow
        const now = new Date();
        let defaultDate;
        if (now.getHours() < 18) {
            defaultDate = now;
        } else {
            defaultDate = new Date(now);
            defaultDate.setDate(now.getDate() + 1);
        }
        setDefaultOrderDate(defaultDate.toISOString().split('T')[0]);
    }, []);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
    };

    const handleOrderDateChange = (supplier, event) => {
        setOrderDate({
            ...orderDate,
            [supplier]: event.target.value
        });
    };

    const getDayName = (date) => {
        const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
        const parsedDate = new Date(date);
        return days[parsedDate.getDay()];
    };

    const renderItems = (supplier, items) => (
        <div style={{ marginBottom: '20px' }}>
            <h2>{supplier}</h2>
            <div style={{ marginBottom: '10px' }}>
                จะสั่งครั้งหน้าวันที่: 
                <span style={{ marginLeft: '10px' }}>
                    {getNextOrderDateForSupplier(supplier, defaultOrderDate)}
                </span>
            </div>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ flex: '1' }}>{item.name}</span>
                        <span style={{ marginLeft: '10px' }}>สต๊อก: [จำนวน]</span>
                        <input 
                            type="text" 
                            placeholder="จำนวน" 
                            style={{ width: '60px', marginLeft: '10px' }} 
                        />
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>สร้างใบสั่งซื้อ</h1>
            <div style={{ marginBottom: '20px' }}>
                สั่งเพื่อรับวันที่: 
                <input 
                    type="date" 
                    value={defaultOrderDate} 
                    readOnly 
                    style={{ marginLeft: '10px' }}
                />
                <span style={{ marginLeft: '10px' }}>
                    ({getDayName(defaultOrderDate) === 'วันนี้' ? 'วันนี้' : 'พรุ่งนี้'})
                </span>
            </div>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
                {TABS.map(tab => (
                    <button 
                        key={tab.key} 
                        onClick={() => handleTabChange(tab.key)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: activeTab === tab.key ? '#28a745' : '#f1f1f1',
                            color: activeTab === tab.key ? 'white' : 'black',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '3px solid #28a745' : 'none',
                            cursor: 'pointer',
                            marginRight: '10px',
                            borderRadius: '5px 5px 0 0'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div>
                {activeTab === 'order-lung-ruay' && (
                    <div>
                        {Object.entries(groupedItems).map(([supplier, items]) => 
                            (supplier === "หมูลุงรวย" || supplier === "จัมโบ้" || supplier === "ลูกชิ้น") && 
                            renderItems(supplier, items)
                        )}
                    </div>
                )}

                {activeTab === 'order-others' && (
                    <div>
                        <div style={{ marginBottom: '10px' }}>
                            วันที่รับของ:
                            <input type="date" style={{ marginLeft: '10px' }} />
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
