// src/app/inventory/hooks/useInventory.js
import { useState, useEffect } from "react";

export const useInventory = (initialData, initialStoreStocks, initialMasterData, initialError) => {
    const [items, setItems] = useState(initialData || []);
    const [storeStocks, setStoreStocks] = useState(initialStoreStocks || {});
    const [masterData, setMasterData] = useState(initialMasterData || {});
    const [filterText, setFilterText] = useState("");
    const [groupBy, setGroupBy] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [error, setError] = useState(initialError || null);

    useEffect(() => {
        if (!initialData) {
            const fetchData = async () => {
                const { items, storeStocks, error } = await fetchItemsStockData();
                setItems(items);
                setStoreStocks(storeStocks);
                setError(error);
            };

            fetchData();
        }
    }, [initialData]);

    const filterInventory = (searchText) => {
        setFilterText(searchText);
    };

    const filteredItems = items.filter((item) => {
        const matchesSearchText = item.item_name.toLowerCase().includes(filterText.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category_name);
        const matchesSupplier = selectedSuppliers.length === 0 || selectedSuppliers.includes(item.supplier_name);
        return matchesSearchText && matchesCategory && matchesSupplier;
    });

    const groupedItems = groupBy !== ""
        ? filteredItems.reduce((acc, item) => {
            const group = item[groupBy] || "ไม่ระบุ";
            if (!acc[group]) acc[group] = [];
            acc[group].push(item);
            return acc;
        }, {})
        : { "": filteredItems };

    console.log("Grouped Items:", groupedItems);

    return { items: groupedItems, storeStocks, masterData, filterText, filterInventory, groupBy, setGroupBy, selectedCategories, setSelectedCategories, selectedSuppliers, setSelectedSuppliers, error };
};