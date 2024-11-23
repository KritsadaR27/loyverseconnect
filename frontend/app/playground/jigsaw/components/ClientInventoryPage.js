"use client";

import React, { useState, useMemo } from "react";
import InventoryActionBar from "./InventoryActionBar";
import InventoryTable from "./InventoryTable";

const ClientInventoryPage = ({ items, storeStocks }) => {
    const [filterText, setFilterText] = useState(""); // ใช้สำหรับกรองข้อมูล

    // ฟังก์ชัน handleSearch ที่จะส่งไปยัง ActionBar
    const handleSearch = (searchText) => {
        setFilterText(searchText); // อัพเดทข้อความสำหรับการค้นหา
    };

    // การกรองข้อมูลในตาราง
    const filteredItems = useMemo(() => {
        return items.filter((item) =>
            item.item_name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [items, filterText]);

    return (
        <> <header className="shadow-sm p-3 bg-gradient-to-bl from-white via-purple-50 to-blue-50 opacity-80 backdrop-blur-lg">

            <InventoryActionBar handleSearch={handleSearch} />
        </header>

            <InventoryTable items={filteredItems} storeStocks={storeStocks} />
        </>
    );
};

export default ClientInventoryPage;
