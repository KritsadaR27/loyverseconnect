import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function MultiSelect({ title, items, selectedItems, toggleItem, onClear, onSelectAll }) {
    const [showDropdown, setShowDropdown] = useState(false); // จัดการ Show/Hide Dropdown
    const [searchTerm, setSearchTerm] = useState(""); // สำหรับการค้นหา
    const dropdownRef = useRef(null);

    // Handle Click Outside to Close Dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    // กรองรายการตาม Search Term
    const filteredItems = items.filter((item) =>
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Button */}
            <button
                onClick={toggleDropdown}
                className={`flex items-center px-4 py-1 text-black rounded border ${selectedItems.length > 0 ? 'bg-blue-600 text-white' : 'bg-white'
                    } ${showDropdown ? 'border-2 border-blue-500' : ''}`}
            >
                <span className="hidden sm:inline">
                    {selectedItems.length > 0 ? `เลือก ${selectedItems.length} ${title}` : `ทุก${title}`}
                </span>
                {showDropdown ? (
                    <ChevronUpIcon className="h-5 w-5 ml-1 inline" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 ml-1 inline" />
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute z-30 bg-white shadow-md border rounded max-h-96 overflow-y-auto w-60"  >
                    {/* Search Bar (เมื่อมี items เกิน 8) */}
                    {items.length > 8 && (
                        <div className="px-2 py-1 border-b">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={`ค้นหา${title}...`}
                                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-300"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-2 py-1 border-b flex flex-row place-content-between">
                        <button onClick={onSelectAll} className="text-blue-500 hover:underline">
                            เลือกทั้งหมด
                        </button>
                        <button onClick={onClear} className="text-red-500 hover:underline ml-2">
                            ไม่เลือก
                        </button>
                    </div>

                    {/* List Items */}
                    {filteredItems.map((item) => (
                        <label key={item.name} className="block px-4 py-2 cursor-pointer hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.name)}
                                onChange={() => toggleItem(item.name)}
                                className="mr-2"
                            />
                            {item.name}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
