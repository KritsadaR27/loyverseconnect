"use client"
// src/components/SupplierSettings.js
import React, { useState, useEffect } from 'react';
import { fetchSuppliers, saveSupplierSettings } from '../../utils/api';
import Navigation from '../../../components/Navigation';
import { useRouter } from 'next/navigation';
import DateFilter from '../../../components/DateFilter';

const daysOfWeek = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

const SupplierSettings = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);


    // รับค่าจาก DateFilter เมื่อผู้ใช้เปลี่ยนตัวเลือกหลัก
    const handleSelectChange = (value) => {
        setSelectedCycle(value);
    };

    // รับค่าจาก DateFilter เมื่อผู้ใช้เปลี่ยนวันใน Multi-select
    const handleDaysChange = (days) => {
        setSelectedDays(days);
    };
    const loadSuppliers = async () => {
        const data = await fetchSuppliers();
        setSuppliers(data.map(supplier => ({
            ...supplier,
            order_cycle: supplier.order_cycle || "",    // เริ่มต้นเป็นค่าว่างถ้าไม่มี
            selected_days: supplier.selected_days || [], // เริ่มต้นเป็นอาร์เรย์ว่างถ้าไม่มี
        })));
        console.log("Loaded suppliers:", data); // ตรวจสอบค่า suppliers ที่โหลดมา
        setLoading(false);
    };

    useEffect(() => {
        loadSuppliers();
    }, []);

    const handleInputChange = (index, field, value) => {
        const updatedSuppliers = suppliers.map((supplier, i) =>
            i === index ? { ...supplier, [field]: value } : supplier
        );
        setSuppliers(updatedSuppliers);
    };

    const handleSave = async () => {
        await saveSupplierSettings(suppliers);
        alert('บันทึกข้อมูลซัพพลายเออร์เรียบร้อยแล้ว!');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navigation /> 
        
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">ตั้งค่าซัพพลายเออร์</h2>
                <table className="min-w-full bg-white shadow-md rounded">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-left">ชื่อซัพพลายเออร์</th>
                            <th className="py-2 px-4 text-left">รอบการสั่งซื้อ</th>

                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier, index) => (
                            <tr key={supplier.id} className="border-b">
                                <td className="py-2 px-4">
                                    <input
                                        type="text"
                                        value={supplier.name}
                                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                        className="border px-2 py-1 w-full"
                                    />
                                </td>
                                <td className="py-2 px-4">
                                <DateFilter 
                                defaultOption={supplier.order_cycle}
                                defaultDays={supplier.selected_days || []}
                                onSelectChange={(value) => handleInputChange(index, 'order_cycle', value)}
                                onDaysChange={(days) => handleInputChange(index, 'selected_days', days)}
                            />


                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button
                    onClick={handleSave}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                >
                    บันทึกการตั้งค่า
                </button>
            </div>
        </div>
    );
};

export default SupplierSettings;
