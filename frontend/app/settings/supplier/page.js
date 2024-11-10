"use client";

import React, { useState, useEffect } from 'react';
// import { fetchSuppliers, saveSupplierSettings, fetchItemsStockData } from '../../utils/api'; 
import { fetchSuppliers, saveSupplierSettings } from '../../utils/api/supplier';
import {  fetchItemsStockData ,saveItemFields} from '../../utils/api/inventory';


import Navigation from '../../../components/Navigation';
import DateFilter from '../../../components/DateFilter';

const SupplierSettings = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSupplier, setExpandedSupplier] = useState(null); // Track which supplier's items are expanded
    const [groupedItems, setGroupedItems] = useState({}); // Store items grouped by supplier
    const [loadingItems, setLoadingItems] = useState(true);

    
    
    const loadItems = async () => {
        setLoadingItems(true);
        console.log("Fetching items...");
        const itemsData = await fetchItemsStockData();
        console.log("Items fetched:", itemsData);
    
        // จัดกลุ่มตาม supplier_id และเก็บ store ต่างๆ ไว้ใน item เดียวกัน
        const grouped = itemsData.reduce((acc, item) => {
            const supplierId = item.supplier_id;
            if (!supplierId) return acc;
    
            if (!acc[supplierId]) acc[supplierId] = new Map();
    
            // หาก item_id ยังไม่อยู่ใน supplier นี้ ให้สร้าง entry ใหม่
            if (!acc[supplierId].has(item.item_id)) {
                acc[supplierId].set(item.item_id, {
                    ...item,
                    stores: [], // สร้าง array เพื่อเก็บ store ต่างๆ
                });
            }
    
            // เพิ่ม store ที่เกี่ยวข้องใน array stores ของ item นี้
            acc[supplierId].get(item.item_id).stores.push({
                store_id: item.store_id,
                store_name: item.store_name,
                in_stock: item.in_stock,
            });
    
            return acc;
        }, {});
    
        // แปลงจาก Map เป็น Object ที่สามารถใช้กับ setState ได้
        const formattedGroupedItems = Object.fromEntries(
            Object.entries(grouped).map(([supplierId, itemsMap]) => [
                supplierId,
                Array.from(itemsMap.values()),
            ])
        );
    
        setGroupedItems(formattedGroupedItems);
        console.log("Grouped Items by Supplier with Stores:", formattedGroupedItems);
        setLoadingItems(false);
    };
    
    
    
    
    
    
    const loadSuppliers = async () => {
        console.log("Fetching suppliers...");
        const data = await fetchSuppliers();
        console.log("Suppliers fetched:", data);
        // เรียงลำดับ suppliers ตาม sort_order
        const sortedSuppliers = data.sort((a, b) => {
            return (a.sort_order || 0) - (b.sort_order || 0);  // เรียงจากน้อยไปมาก
        });

        setSuppliers(sortedSuppliers.map(supplier => ({
            ...supplier,
            order_cycle: supplier.order_cycle || "",    // Set default empty if missing
            selected_days: supplier.selected_days || [], // Set default empty array if missing
        })));
        setLoading(false);
    };

    useEffect(() => {
        console.log("useEffect for loading suppliers and items running...");
        loadSuppliers();
        loadItems();
    }, []);

  
    
    const handleInputChange = (index, field, value) => {
        suppliers[index][field] = value; // Directly update the state
        setSuppliers([...suppliers]); // Trigger a re-render by creating a shallow copy
    };
    
    const handleItemSupplierCallChange = (supplierId, itemId, value) => {
        setGroupedItems(prevState => {
            const updatedGroupedItems = { ...prevState };
            
            // Find the supplier and item to update
            const supplierItems = updatedGroupedItems[supplierId];
            if (supplierItems) {
                const item = supplierItems.find(i => i.item_id === itemId);
                if (item) {
                    item.item_supplier_call = value; // Update the supplier call
                }
            }
    
            return updatedGroupedItems;
        });
    };
    

    
    
    const handleSave = async () => {
        const suppliersToSend = suppliers.map(supplier => ({
            supplier_id: supplier.supplier_id || "default_supplier_id",
            order_cycle: supplier.order_cycle || "",
            sort_order: Number(supplier.sort_order) || 0, // Forcefully convert to number, fallback to 0 if NaN
            selected_days: supplier.selected_days || []
        }));
    
        // เตรียมข้อมูล item_supplier_call ที่ต้องส่งไป
        const itemsToSend = Object.keys(groupedItems).flatMap(supplierId => {
            return groupedItems[supplierId].map(item => ({
                item_id: item.item_id,
                item_supplier_call: item.item_supplier_call || ""  // ถ้าไม่มีจะเป็นค่าว่าง
            }));
        });
    
        console.log("Items to send:", itemsToSend);  // ตรวจสอบข้อมูลที่จะส่งไป
    
        try {
            // ส่งข้อมูลไปที่ API ของ suppliers
            const supplierResult = await saveSupplierSettings(suppliersToSend);
    
            // ส่งข้อมูลไปที่ API ของ item_supplier_call
            const itemResult = await saveItemFields(itemsToSend); // ส่ง itemsToSend แบบ array
    
            console.log("itemResult", itemResult); // ตรวจสอบผลลัพธ์จาก API
    
            if (supplierResult.success && itemResult.message === "Item supplier settings saved successfully") {
                alert('บันทึกข้อมูลซัพพลายเออร์และรายการสินค้าซัพพลายเออร์เรียบร้อยแล้ว!');
            } else {
                alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล!');
            }

                    } catch (error) {
                        console.error("Error saving item fields:", error);
                        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล!');
                    }
                };
                

    
    
    

    const toggleExpand = (supplierId) => {
        setExpandedSupplier(expandedSupplier === supplierId ? null : supplierId);
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
                            <th className="py-2 px-4 text-left">รายการสินค้า</th>
                        </tr>
                    </thead>
                    <tbody>
    {suppliers.map((supplier, index) => (
        <React.Fragment key={supplier.supplier_id}>
            <tr className="border-b">
                <td className="py-2 px-4">{supplier.supplier_name}</td>
                <td className="py-2 px-4">
                <DateFilter 
                    label="เลือกการสั่งซื้อ"
                    defaultOption={supplier.order_cycle}
                    defaultDays={supplier.selected_days}  // ส่ง selected_days ไปให้ DateFilter เพื่อให้ฟอร์มแสดงค่าที่เลือก
                    onSelectChange={(value) => handleInputChange(index, 'order_cycle', value)}
                    onDaysChange={(days) => handleInputChange(index, 'selected_days', days)}
                />

                </td>
                <td className="py-2 px-4">
                    <input 
                        type="number" 
                        value={supplier.sort_order || 0}  // Ensure default empty string if null
                        onChange={(e) => handleInputChange(index, 'sort_order', e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full"
                        placeholder="Sort Order"
                    />
                </td>
                <td className="py-2 px-4">
                    <button
                        onClick={() => toggleExpand(supplier.supplier_id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    >
                        {expandedSupplier === supplier.supplier_id ? 'ซ่อนรายการสินค้า' : 'ดูรายการสินค้า'}
                    </button>
                </td>
            </tr>
            {expandedSupplier === supplier.supplier_id && (
                <tr>
                    <td colSpan="4" className="p-4 bg-gray-100">
                        <table className="bg-yellow-100 w-full">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 text-left">ชื่อสินค้า</th>
                                    <th className="py-2 px-4 text-left">ชื่อเรียกผู้ขาย</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(groupedItems[supplier.supplier_id] || []).map(item => (
                                    <tr key={`${supplier.supplier_id}-${item.item_id}`} className="py-1 border-b">
                                        <td className="py-2 px-4">{item.item_name}</td> 
                                        <td className="py-2 px-4">
                                            <input
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={item.item_supplier_call}
                                                onChange={(e) => handleItemSupplierCallChange(supplier.supplier_id, item.item_id, e.target.value)}
                                                type="text"
                                                
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </React.Fragment>
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
