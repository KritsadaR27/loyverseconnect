// src/app/(domains)/item-stock/pages/page.js
import React from "react";
import SidebarLayout from "../../../components/layouts/SidebarLayout";
// import Table from "../components/Table"; // Table Component
// import { useFetchItems } from "../hooks/useFetchItems"; // Custom Hook

const ItemStockPage = () => {
    const { items, loading, error } = useFetchItems();

    const columns = [
        { Header: "ชื่อสินค้า", accessor: "item_name" },
        { Header: "จำนวน", accessor: "in_stock" },
        { Header: "ราคา", accessor: "selling_price" },
    ];

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <SidebarLayout headerTitle="สต็อกสินค้า">
            
        </SidebarLayout>
    );
};

export default ItemStockPage;
