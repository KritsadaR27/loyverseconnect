"use client"
import React, { useState, useEffect, useRef } from 'react';
import SidebarLayout from "../../../components/layouts/SidebarLayout";
import GridActionBar from "./components/GridActionBar";
import GridTable from '../../../components/GridTable/GridTable';
import { mockItems, categories } from './mockData';

const GridPage = () => {
    const [items, setItems] = useState(mockItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [groupBy, setGroupBy] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const inputRefs = useRef({});
    const [highlightedItemId, setHighlightedItemId] = useState(null);

    const handleSearch = (term) => {
        setSearchTerm(term);
        // Implement search logic here
    };

    const handleFilterChange = (filter) => {
        setFilter(filter);
        // Implement filter logic here
    };

    const handleCellChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories);
        // Implement category filter logic here
    };

    const mapItemToColumns = (item, index) => [
        {
            type: 'text',
            value: item.name,
            tdClassName: 'text-left',
            onChange: (value) => handleCellChange(index, 'name', value),
            accessor: 'name'
        },
        {
            type: 'number',
            value: item.quantity,
            tdClassName: 'text-right',
            onChange: (value) => handleCellChange(index, 'quantity', value),
            accessor: 'quantity'
        },
        {
            type: 'currency',
            value: item.price,
            tdClassName: 'text-right',
            onChange: (value) => handleCellChange(index, 'price', value),
            accessor: 'price'
        },
        {
            type: 'multiselect',
            value: item.category,
            options: categories,
            onChange: (value) => handleCellChange(index, 'category', value),
            accessor: 'category',
        },
        {
            type: 'datefilter',
            value: item.datefilter,
            onChange: (value) => handleCellChange(index, 'datefilter', value),
            accessor: 'datefilter'
        },
        {
            type: 'datepicker',
            value: item.datepicker,
            onChange: (value) => handleCellChange(index, 'datepicker', value),
            accessor: 'datepicker'
        },
        {
            type: 'boolean',
            value: item.boolean,
            onChange: (value) => handleCellChange(index, 'boolean', value),
            accessor: 'boolean'
        },
        {
            type: 'link',
            value: item.link,
            onChange: (value) => handleCellChange(index, 'link', value),
            accessor: 'link'
        },
        {
            type: 'phone',
            value: item.phone,
            onChange: (value) => handleCellChange(index, 'phone', value),
            accessor: 'phone'
        },
        {
            type: 'location',
            value: item.location,
            onChange: (value) => handleCellChange(index, 'location', value),
            accessor: 'location'
        },
    ];

    const transformItem = (item, index, primaryId) => {
        const id = item[primaryId] || index;
        return {
            ...item,
            id, // ใช้ id ที่แปลงแล้ว
        };
    };

    const primaryId = 'item_id'; // กำหนด primaryId ที่ต้องการใช้
    const transformedItems = items.map((item, index) => transformItem(item, index, primaryId));

    const toggleExpand = (itemId) => {
        setExpandedItems((prevExpandedItems) => ({
            ...prevExpandedItems,
            [itemId]: !prevExpandedItems[itemId], // Toggle expand for the item
        }));
    };

    const moveItem = (fromIndex, toIndex) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            const [movedItem] = updatedItems.splice(fromIndex, 1);
            updatedItems.splice(toIndex, 0, movedItem);
            return updatedItems;
        });
    };

    useEffect(() => {
        // Load items or any other data if needed
    }, []);

    const fields = [
        { Header: 'Name', accessor: 'name', canGroup: true },
        { Header: 'Quantity', accessor: 'quantity', canGroup: true },
        { Header: 'Price', accessor: 'price', canGroup: true },
        { Header: 'Category', accessor: 'category', canGroup: true },
        { Header: 'Date Filter', accessor: 'datefilter', canGroup: true },
        { Header: 'Date Picker', accessor: 'datepicker', canGroup: true },
        { Header: 'Boolean', accessor: 'boolean', canGroup: true },
        { Header: 'Link', accessor: 'link', canGroup: true },
        { Header: 'Phone', accessor: 'phone', canGroup: true },
        { Header: 'Location', accessor: 'location', canGroup: true },
    ];

    const groupOperations = {
        quantity: 'sum',
        price: 'average',
        // เพิ่มการคำนวณอื่นๆ ตามต้องการ
    };

    return (
        <SidebarLayout headerTitle="Powerful Grid" actionBar={<GridActionBar onSearch={handleSearch} onFilterChange={handleFilterChange} groupBy={groupBy} onGroupByChange={setGroupBy} fields={fields} categories={categories} selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange} />}>
            <GridTable
                headers={['Name', 'Quantity', 'Price', 'Category', 'Date Filter', 'Date Picker', 'Boolean', 'Link', 'Phone', 'Location']}
                items={transformedItems}
                mapItemToColumns={mapItemToColumns}
                onMoveItem={moveItem}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                onCellChange={handleCellChange}
                inputRefs={inputRefs}
                highlightedItemId={highlightedItemId}
                groupBy={groupBy}
                groupOperations={groupOperations}
            />
        </SidebarLayout>
    );
};

export default GridPage;