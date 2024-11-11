"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSuppliers, saveSupplierSettings } from '../../utils/api/supplier';
import { fetchItemsStockData, saveItemFields } from '../../utils/api/inventory';
import Navigation from '../../../components/Navigation';
import DateFilter from '../../../components/DateFilter';
import DraggableTable from '../../../components/DraggableTable'; // เพิ่มการ import คอมโพเนนต์
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'; // Import backend

const SupplierSettings = () => {
    const [groupedItems, setGroupedItems] = useState({}); // Store items grouped by supplier
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSupplier, setExpandedSupplier] = useState(null); // Track which supplier's items are expanded
    const [loadingItems, setLoadingItems] = useState(true);
    const inputRefs = useRef({});
    const [highlightedSupplierId, setHighlightedSupplierId] = useState(null);


    const filteredSuppliers = suppliers.filter(supplier => groupedItems[supplier.supplier_id] && groupedItems[supplier.supplier_id].length > 0);
    console.log("filteredSuppliers" , filteredSuppliers)
    console.log("suppliers" , suppliers)
    const [expandedItems, setExpandedItems] = useState({}); // Track multiple expanded items
    const toggleExpand = (supplierId) => {
        setExpandedItems((prevExpandedItems) => ({
            ...prevExpandedItems,
            [supplierId]: !prevExpandedItems[supplierId], // Toggle expand for the supplier
        }));
    };
    const loadSuppliers = async () => {
        const data = await fetchSuppliers();
        console.log("Suppliers fetched:", data);

        // Sort suppliers by sort_order
        const sortedSuppliers = data.sort((a, b) => {
            return (a.sort_order || 0) - (b.sort_order || 0);  // Sort in ascending order
        });

        setSuppliers(sortedSuppliers.map(supplier => ({
            ...supplier,
            order_cycle: supplier.order_cycle || "",    // Set default empty if missing
            selected_days: supplier.selected_days || [], // Set default empty array if missing
        })));
        setLoading(false);
    };

    const loadItems = async () => {
        setLoadingItems(true);

        const itemsData = await fetchItemsStockData();
        console.log("Items fetched:", itemsData);

        const grouped = itemsData.reduce((acc, item) => {
            const supplierId = item.supplier_id;
            if (!supplierId) return acc;

            if (!acc[supplierId]) acc[supplierId] = new Map();

            // If item_id is not in the supplier, create a new entry
            if (!acc[supplierId].has(item.item_id)) {
                acc[supplierId].set(item.item_id, {
                    ...item,
                    stores: [], // Create array to hold stores
                });
            }

            // Add store related to the item
            acc[supplierId].get(item.item_id).stores.push({
                store_id: item.store_id,
                store_name: item.store_name,
                in_stock: item.in_stock,
            });

            return acc;
        }, {});

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

    useEffect(() => {
        loadSuppliers();
        loadItems();
    }, []);

    const handleSave = async () => {
        const suppliersToSend = suppliers.map(supplier => ({
            supplier_id: supplier.supplier_id || "default_supplier_id",
            order_cycle: supplier.order_cycle || "",
            sort_order: Number(supplier.sort_order) || 0, // Forcefully convert to number, fallback to 0 if NaN
            selected_days: supplier.selected_days || []
        }));

        const itemsToSend = Object.keys(groupedItems).flatMap(supplierId => {
            return groupedItems[supplierId].map(item => ({
                item_id: item.item_id,
                item_supplier_call: item.item_supplier_call || "" // If none, will be empty string
            }));
        });

        console.log("Items to send:", itemsToSend);

        try {
            const supplierResult = await saveSupplierSettings(suppliersToSend);
            const itemResult = await saveItemFields(itemsToSend);

            console.log("itemResult", itemResult);

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
 
      // ฟังก์ชันที่ใช้ในการทำให้ช่อง input โดดเด่น (highlighted)
    const handleFocus = (supplierId) => {
        setHighlightedSupplierId(supplierId);
        if (inputRefs.current[supplierId]) {
            inputRefs.current[supplierId].select();
        }
    };

    const handleBlur = () => {
        setHighlightedSupplierId(null); // เมื่อไม่อยู่ในช่องให้หยุดการไฮไลต์
    };

    const handleInputChange = (supplierId, field, value) => {
        // ใช้ map เพื่อสร้าง array ใหม่ โดยอัปเดตเฉพาะ supplier ที่ตรงกับ supplierId
        const updatedSuppliers = suppliers.map(supplier =>
            supplier.supplier_id === supplierId ? { ...supplier, [field]: value } : supplier
        );
        setSuppliers(updatedSuppliers); // อัปเดต state ด้วย array ใหม่
    };
    
    const mapSupplierToColumns = (supplier) => [
        supplier.supplier_name || "ไม่ระบุ",
        <DateFilter
            label="เลือกรอบการสั่ง"
            defaultOption={supplier.order_cycle}
            defaultDays={supplier.selected_days}
            onSelectChange={(value) => handleInputChange(supplier.supplier_id, 'order_cycle', value)}
            onDaysChange={(days) => handleInputChange(supplier.supplier_id, 'selected_days', days)}
        />,
        <input
            ref={el => inputRefs.current[supplier.supplier_id] = el}
            type="number"
            value={supplier.sort_order || 0}
            onChange={(e) => handleInputChange(supplier.supplier_id, 'sort_order', e.target.value)}
            onFocus={() => handleFocus(supplier.supplier_id)}
            onBlur={handleBlur}
            className={`p-2 border ${highlightedSupplierId === supplier.supplier_id ? 'border-blue-500 bg-yellow-100' : 'border-gray-300'} rounded w-full`}
            placeholder="Sort Order"
        />,
        <button
            onClick={() => toggleExpand(supplier.supplier_id)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
            {expandedSupplier === supplier.supplier_id ? 'ซ่อนรายการสินค้า' : 'ดูรายการสินค้า'}
        </button>
        
    
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navigation />
            <div className="container min-w-full mx-auto p-4 bg-gray-100">
                <h2 className="text-2xl font-bold mb-4">ตั้งค่าซัพพลายเออร์</h2>
              
                {filteredSuppliers.length > 0 && ( // Render only when filteredSuppliers has data

                <DndProvider backend={HTML5Backend}>
                    <DraggableTable 
                        headers={['ชื่อซัพพลายเออร์', 'รอบการสั่งซื้อ', 'ลำดับ', 'รายการสินค้า']}
                        items={filteredSuppliers}
                        mapItemToColumns={mapSupplierToColumns}
                        onMoveItem={(from, to) => console.log(`Moved from ${from} to ${to}`)} 

                        expandedItems={expandedItems}  // Pass updated expandedItems

                        toggleExpand={toggleExpand}
                        expandedContent={(supplier) => (
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
                                            <td className="py-2 px-4">{item.item_supplier_call}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    />
                </DndProvider>
                )}

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
