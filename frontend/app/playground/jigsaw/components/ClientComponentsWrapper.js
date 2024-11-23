// ClientComponentsWrapper.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import ActionBar from "./ActionBar";
import Table from "./Table";

const fetchItemsStockData = async () => {
    let items = [];
    let storeStocks = {}; // เพิ่มตัวแปร storeStocks
    let error = null;

    try {
        const response = await fetch(`http://localhost:8082/api/item-stock`, {
            cache: "no-store",
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawItems = await response.json();

        // Grouping logic
        const groupedItems = [];
        storeStocks = {}; // สร้าง storeStocks เป็นวัตถุ

        rawItems.forEach((item) => {
            // Check if the item already exists in groupedItems
            const existingItem = groupedItems.find((i) => i.item_id === item.item_id);

            if (existingItem) {
                // Increment the total stock for grouped items
                existingItem.in_stock += item.in_stock;
            } else {
                // Add new item to groupedItems
                groupedItems.push({ ...item });
            }

            // Add store-specific stock details
            if (!storeStocks[item.item_id]) {
                storeStocks[item.item_id] = [];
            }
            storeStocks[item.item_id].push({
                store_name: item.store_name,
                in_stock: item.in_stock,
            });
        });

        items = groupedItems;
    } catch (err) {
        console.error("Error fetching items:", err.message);
        error = err.message;
    }

    return { items, storeStocks, error };
};

const fetchMasterData = async () => {
    const res = await fetch('http://localhost:8080/api/masterdata');
    if (!res.ok) {
        throw new Error(`Failed to fetch master data: ${res.status} ${res.statusText}`);
    }
    return res.json();
};

export default function ClientComponentsWrapper({ initialData, storeStocks, error }) {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [filterMatchesOnly, setFilterMatchesOnly] = useState(false);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [groupBy, setGroupBy] = useState("");
    const [expandedGroups, setExpandedGroups] = useState({});
    const tableRef = useRef(null);

    const fetchMetadata = async () => {
        const masterData = await fetchMasterData();
        setCategories(masterData.categories);
        setStores(masterData.stores);
        setSuppliers(masterData.suppliers);
    };

    const handleSearch = async (searchTerm) => {
        setSearchTerm(searchTerm);
        const { items, storeStocks, error } = await fetchItemsStockData();
        setData(items);
        setCurrentIndex(0); // Reset current index when new search is performed
    };

    useEffect(() => {
        fetchMetadata();
        handleSearch("");
    }, []);

    useEffect(() => {
        // ตั้งค่า expandedGroups ให้เป็น true สำหรับทุกกลุ่มเมื่อเปิดหน้าแรก
        const initialExpandedGroups = {};
        Object.keys(groupedData).forEach((group) => {
            initialExpandedGroups[group] = true;
        });
        setExpandedGroups(initialExpandedGroups);
    }, [groupBy]);

    const handleNext = () => {
        const nextIndex = matchedData.findIndex((item, index) => index > currentIndex && item.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
            scrollToItem(nextIndex);
        }
    };

    const handleBack = () => {
        const prevIndex = matchedData.slice(0, currentIndex).reverse().findIndex((item) => item.item_name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (prevIndex !== -1) {
            setCurrentIndex(currentIndex - prevIndex - 1);
            scrollToItem(currentIndex - prevIndex - 1);
        }
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(category)
                ? prevCategories.filter((cat) => cat !== category)
                : [...prevCategories, category]
        );
    };

    const handleStoreChange = (store) => {
        setSelectedStores((prevStores) =>
            prevStores.includes(store)
                ? prevStores.filter((st) => st !== store)
                : [...prevStores, store]
        );
    };

    const handleSupplierChange = (supplier) => {
        setSelectedSuppliers((prevSuppliers) =>
            prevSuppliers.includes(supplier)
                ? prevSuppliers.filter((sup) => sup !== supplier)
                : [...prevSuppliers, supplier]
        );
    };

    const handleFilterMatchesOnlyChange = () => {
        setFilterMatchesOnly((prev) => !prev);
    };

    const handleGroupByChange = (field) => {
        if (field === "store") {
            setGroupBy(""); // ไม่อนุญาตให้จับกลุ่มตาม store
        } else {
            setGroupBy(field);
        }
        const initialExpandedGroups = {};
        Object.keys(groupedData).forEach((group) => {
            initialExpandedGroups[group] = true;
        });
        setExpandedGroups(initialExpandedGroups);
    };

    const expandAllGroups = () => {
        const allExpanded = {};
        Object.keys(groupedData).forEach((group) => {
            allExpanded[group] = true;
        });
        setExpandedGroups(allExpanded);
    };

    const collapseAllGroups = () => {
        const allCollapsed = {};
        Object.keys(groupedData).forEach((group) => {
            allCollapsed[group] = false;
        });
        setExpandedGroups(allCollapsed);
    };

    const toggleGroup = (group) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const scrollToItem = (index) => {
        if (tableRef.current) {
            const row = tableRef.current.querySelectorAll("tbody tr")[index];
            if (row) {
                row.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    };

    const filteredData = data.filter((item) => {
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_name);
        const matchesStore = selectedStores.length === 0 || selectedStores.includes(item.store_name);
        const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(item.supplier_name);
        return matchesCategory && matchesStore && matchesSupplier;
    });

    const matchedData = filteredData.filter((item) =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedData = filterMatchesOnly ? matchedData : filteredData;

    const groupedData = groupBy
        ? displayedData.reduce((acc, item) => {
            const group = item[groupBy];
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {})
        : { All: displayedData };

    return (
        <div className="p-4">
            <ActionBar
                className="sticky top-0 bg-white z-10"
                onSearch={handleSearch}
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                stores={stores}
                selectedStores={selectedStores}
                onStoreChange={handleStoreChange}
                suppliers={suppliers}
                selectedSuppliers={selectedSuppliers}
                onSupplierChange={handleSupplierChange}
                currentIndex={currentIndex}
                filteredDataLength={matchedData.length}
                handleNext={handleNext}
                handleBack={handleBack}
                filterMatchesOnly={filterMatchesOnly}
                onFilterMatchesOnlyChange={handleFilterMatchesOnlyChange}
                groupBy={groupBy}
                onGroupByChange={handleGroupByChange}
            />
            <Table
                ref={tableRef}
                data={groupedData}
                searchTerm={searchTerm}
                currentIndex={currentIndex}
                toggleGroup={toggleGroup}
                expandedGroups={expandedGroups}
                expandAllGroups={expandAllGroups}
                collapseAllGroups={collapseAllGroups}
            />
        </div>
    );
}