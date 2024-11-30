// frontend/app/sales/salesbyitems/components/SalesByItemActionBar.js

import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SalesByItemActionBar = ({ filterText, setFilterText }) => {
    const handleSearchChange = (e) => {
        setFilterText(e.target.value);
    };

    const clearSearch = () => {
        setFilterText("");
    };

    return (
        <div className="flex items-center justify-between py-1.5 rounded-md" style={{ maxWidth: '100vw' }}>
            <div className="relative flex-shrink-0 items-center space-x-1">
                <div className="relative">
                    <input
                        type="text"
                        value={filterText}
                        onChange={handleSearchChange}
                        placeholder="ค้นหาสินค้า..."
                        className="border border-gray-300 rounded-md pl-8 pr-0 py-1 text-sm h-9 focus:ring-blue-500 focus:border-blue-500 w-60"
                    />
                    {filterText && (
                        <button onClick={clearSearch} className="absolute right-2 top-2 w-4 h-4 text-gray-500">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    )}
                    <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
                </div>
            </div>
        </div>
    );
};

export default SalesByItemActionBar;