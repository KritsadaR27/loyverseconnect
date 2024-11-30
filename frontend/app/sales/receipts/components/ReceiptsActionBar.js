// src/app/receipts/components/ReceiptsActionBar.js
import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MultiSelect from '../../../../components/MultiSelect';


const ReceiptsActionBar = ({ filterText, setFilterText, stores, selectedStores, setSelectedStores, employees, selectedEmployees, setSelectedEmployees }) => {
    const [showSearchInput, setShowSearchInput] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        console.log("Stores:", stores); // ตรวจสอบข้อมูลร้านค้าที่ถูกส่งไปยัง MultiSelect
        console.log("Selected Stores:", selectedStores); // ตรวจสอบข้อมูลร้านค้าที่ถูกเลือก
    }, [stores, selectedStores]);

    const handleSearchChange = (e) => {
        setFilterText(e.target.value);
    };

    const clearSearch = () => {
        setFilterText("");
    };

    const toggleSearchInput = () => {
        setShowSearchInput((prev) => !prev);
    };

    const handleStoreChange = (store) => {
        setSelectedStores((prev) =>
            prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
        );
    };

    const handleEmployeeChange = (employee) => {
        setSelectedEmployees((prev) =>
            prev.includes(employee) ? prev.filter((e) => e !== employee) : [...prev, employee]
        );
    };

    const clearStores = () => {
        setSelectedStores([]);
    };

    const selectAllStores = () => {
        setSelectedStores(stores.map((store) => store.name));
    };

    const clearEmployees = () => {
        setSelectedEmployees([]);
    };

    const selectAllEmployees = () => {
        setSelectedEmployees(employees.map((employee) => employee.name));
    };

    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            {/* Left Section */}
            <div className="flex items-center space-x-5">
                <MultiSelect
                    title="ร้านค้า"
                    items={stores}
                    selectedItems={selectedStores}
                    toggleItem={handleStoreChange}
                    onClear={clearStores}
                    onSelectAll={selectAllStores}
                />

                <MultiSelect
                    title="พนักงาน"
                    items={employees}
                    selectedItems={selectedEmployees}
                    toggleItem={handleEmployeeChange}
                    onClear={clearEmployees}
                    onSelectAll={selectAllEmployees}
                />
            </div>
            {/* Right Section */}
            <div className="relative flex-shrink-0 items-center space-x-1">
                {/* Search Input */}
                <div className="relative" ref={searchInputRef}>
                    {showSearchInput ? (
                        <>
                            <input
                                type="text"
                                value={filterText}
                                onChange={handleSearchChange}
                                placeholder="ค้นหาใบเสร็จ..."
                                className="border border-gray-300 rounded-md pl-8 pr-0 py-1 text-sm h-9 focus:ring-blue-500 focus:border-blue-500 w-60"
                            />
                            {filterText && (
                                <button onClick={clearSearch} className="absolute right-2 top-2 w-4 h-4 text-gray-500">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                            <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                        </>
                    ) : (
                        <button onClick={toggleSearchInput} className="p-2">
                            <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    )}
                </div>
            </div>
            {/* Selected Filters */}
            {(selectedStores.length > 0 || selectedEmployees.length > 0) && (
                <div className="flex items-center bg-blue-100 rounded py-2 px-3 border">
                    {selectedStores.length > 0 && (
                        <>
                            <span className="bg-yellow-300 p-1 rounded-md">ร้านค้า:</span>
                            {selectedStores.map((store) => (
                                <div key={store} className="flex items-center bg-blue-500 text-white font-bold mx-1 px-2 py-1 rounded-full text-sm">
                                    {store} <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => handleStoreChange(store)} />
                                </div>
                            ))}
                        </>
                    )}
                    {selectedEmployees.length > 0 && (
                        <>
                            <span className="bg-yellow-300 p-1 rounded-md ml-3">พนักงาน:</span>
                            {selectedEmployees.map((employee) => (
                                <div key={employee} className="flex items-center bg-blue-500 text-white font-bold mx-1 px-2 py-1 rounded-full text-sm">
                                    {employee} <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => handleEmployeeChange(employee)} />
                                </div>
                            ))}
                        </>
                    )}
                    <button onClick={() => { clearStores(); clearEmployees(); }} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm ml-auto">
                        ยกเลิกกรอง
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReceiptsActionBar;