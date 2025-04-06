// frontend/app/settings/supplier/page.js
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSuppliers, saveSupplierSettings } from '../../utils/api/supplier';
import { fetchItemsStockData, saveItemFields } from '../../utils/api/inventory';
import SidebarLayout from '../../../components/layouts/SidebarLayout';
import SupplierSettingsActionBar from './components/SupplierSettingsActionBar';
import SupplierSettingsTable from './components/SupplierSettingsTable';

const SupplierSettings = () => {
    const [groupedItems, setGroupedItems] = useState({}); // Store items grouped by supplier
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState({}); // Track multiple expanded items
    const inputRefs = useRef({});
    const [highlightedSupplierId, setHighlightedSupplierId] = useState(null);

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
    };

    const loadItems = async () => {
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
    };

    const handleInputChange = (supplierId, field, value) => {
        setSuppliers((prevSuppliers) =>
            prevSuppliers.map((supplier) =>
                supplier.supplier_id === supplierId
                    ? { ...supplier, [field]: value }
                    : supplier
            )
        );
    };

    const handleItemInputChange = (itemId, field, value) => {
        setGroupedItems((prevGroupedItems) => {
            const updatedGroupedItems = { ...prevGroupedItems };
            Object.keys(updatedGroupedItems).forEach((supplierId) => {
                const items = updatedGroupedItems[supplierId];
                const itemIndex = items.findIndex((item) => item.item_id === itemId);
                if (itemIndex !== -1) {
                    items[itemIndex] = { ...items[itemIndex], [field]: value };
                }
            });
            return updatedGroupedItems;
        });
    };

    const moveSupplier = (fromIndex, toIndex) => {
        setSuppliers((prevSuppliers) => {
            const updatedSuppliers = [...prevSuppliers];
            const [movedSupplier] = updatedSuppliers.splice(fromIndex, 1);
            updatedSuppliers.splice(toIndex, 0, movedSupplier);
            return updatedSuppliers;
        });
    };

    useEffect(() => {
        loadSuppliers();
        loadItems();
    }, []);

    return (
        <SidebarLayout headerTitle="Supplier Settings">
            <SupplierSettingsActionBar />
            <SupplierSettingsTable
                suppliers={suppliers}
                groupedItems={groupedItems}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                handleInputChange={handleInputChange}
                handleItemInputChange={handleItemInputChange}
                moveSupplier={moveSupplier}
                inputRefs={inputRefs}
                highlightedSupplierId={highlightedSupplierId}
            />
        </SidebarLayout>
    );
};

export default SupplierSettings;
