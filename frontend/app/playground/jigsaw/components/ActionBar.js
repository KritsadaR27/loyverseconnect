"use client";

// /app/playground/jigsaw/components/ActionBar.js
import React, { useState } from 'react';

export default function ActionBar({ className, onSearch, categories = [], selectedCategories, onCategoryChange, stores = [], selectedStores, onStoreChange, suppliers = [], selectedSuppliers, onSupplierChange, currentIndex, filteredDataLength, handleNext, handleBack, filterMatchesOnly, onFilterMatchesOnlyChange, groupBy, onGroupByChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCategories, setShowCategories] = useState(false);
    const [showStores, setShowStores] = useState(false);
    const [showSuppliers, setShowSuppliers] = useState(false);

    const handleChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        onSearch(value); // เรียก handleSearch เมื่อผู้ใช้พิมพ์ข้อความ
    };

    const toggleCategories = () => {
        setShowCategories(!showCategories);
    };

    const toggleStores = () => {
        setShowStores(!showStores);
    };

    const toggleSuppliers = () => {
        setShowSuppliers(!showSuppliers);
    };

    return (
        <div className={`mb-4 ${className}`}>
            <div className="flex items-center mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleChange}
                    placeholder="Search..."
                    className="px-4 py-2 border rounded w-full mr-2"
                />
                <button
                    onClick={toggleCategories}
                    className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                >
                    {selectedCategories.length === 0
                        ? "ทั้งหมด 10 หมวดหมู่"
                        : `เลือก ${selectedCategories.length} หมวดหมู่`}
                </button>
                <button
                    onClick={toggleStores}
                    className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                >
                    {selectedStores.length === 0
                        ? "ทั้งหมด 9 ร้านค้า"
                        : `เลือก ${selectedStores.length} ร้านค้า`}
                </button>
                <button
                    onClick={toggleSuppliers}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    {selectedSuppliers.length === 0
                        ? "ทั้งหมด 14 ซัพพลายเออร์"
                        : `เลือก ${selectedSuppliers.length} ซัพพลายเออร์`}
                </button>
            </div>
            {showCategories && (
                <div className="absolute z-10 bg-white border rounded mt-2 w-full shadow-lg">
                    {categories.map((category) => (
                        <label key={category.id} className="block px-4 py-2">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.name)}
                                onChange={() => onCategoryChange(category.name)}
                                className="mr-2"
                            />
                            {category.name}
                        </label>
                    ))}
                </div>
            )}
            {showStores && (
                <div className="absolute z-10 bg-white border rounded mt-2 w-full shadow-lg">
                    {stores.map((store) => (
                        <label key={store.id} className="block px-4 py-2">
                            <input
                                type="checkbox"
                                checked={selectedStores.includes(store.name)}
                                onChange={() => onStoreChange(store.name)}
                                className="mr-2"
                            />
                            {store.name}
                        </label>
                    ))}
                </div>
            )}
            {showSuppliers && (
                <div className="absolute z-10 bg-white border rounded mt-2 w-full shadow-lg">
                    {suppliers.map((supplier) => (
                        <label key={supplier.id} className="block px-4 py-2">
                            <input
                                type="checkbox"
                                checked={selectedSuppliers.includes(supplier.name)}
                                onChange={() => onSupplierChange(supplier.name)}
                                className="mr-2"
                            />
                            {supplier.name}
                        </label>
                    ))}
                </div>
            )}
            {filteredDataLength > 0 && (
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={handleBack}
                        disabled={currentIndex === 0}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Back
                    </button>
                    <span className="text-lg">{currentIndex + 1} / {filteredDataLength}</span>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === filteredDataLength - 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                    >
                        Next
                    </button>
                </div>
            )}
            <div className="mt-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        checked={filterMatchesOnly}
                        onChange={onFilterMatchesOnlyChange}
                        className="mr-2"
                    />
                    กรองเฉพาะผลลัพธ์ที่ตรงกับการค้นหา
                </label>
            </div>
            <div className="mt-4">
                <label className="block mb-2">จับกลุ่มตาม:</label>
                <select
                    value={groupBy}
                    onChange={(e) => onGroupByChange(e.target.value)}
                    className="px-4 py-2 border rounded w-full"
                >
                    <option value="">ไม่จับกลุ่ม</option>
                    <option value="category_name">หมวดหมู่</option>
                    <option value="supplier_name">ซัพพลายเออร์</option>
                </select>
            </div>
        </div>
    );
}
