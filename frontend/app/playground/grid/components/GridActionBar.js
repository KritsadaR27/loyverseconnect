import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, AdjustmentsHorizontalIcon as GroupIcon } from '@heroicons/react/24/outline';
import MultiSelect from '../../../../components/MultiSelect';


const GridActionBar = ({ onSearch, onFilterChange, groupBy, onGroupByChange, fields, categories, selectedCategories, onCategoryChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showGroupBy, setShowGroupBy] = useState(false);
    const groupByRef = useRef(null);

    const handleSearch = (term) => {
        setSearchTerm(term);
        onSearch(term);
    };

    const toggleGroupBy = () => {
        setShowGroupBy(!showGroupBy);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (groupByRef.current && !groupByRef.current.contains(event.target)) {
                setShowGroupBy(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center space-x-4 mb-4">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="border p-2 rounded"
            />
            <MultiSelect
                title="Categories"
                items={categories}
                selectedItems={selectedCategories}
                toggleItem={onCategoryChange}
                onClear={() => onCategoryChange([])}
                onSelectAll={() => onCategoryChange(categories.map(category => category.name))}
                context="actionbar"
            />
            <div className="relative flex-shrink-0 items-center space-x-2" ref={groupByRef}>
                <button onClick={toggleGroupBy} className={`flex items-center bg-gray-200 px-4 py-1 rounded border hover:bg-gray-300 transition ${groupBy ? 'bg-green-600 text-white' : ''} ${showGroupBy ? 'border-2 border-blue-500' : ''}`}>
                    <GroupIcon className="h-5 w-5 mr-1 inline" /> <span className="hidden sm:inline">{groupBy ? `จัดกลุ่ม ${fields.find(field => field.accessor === groupBy)?.Header || ''}` : 'จัดกลุ่ม'}</span>
                    {groupBy && (
                        <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => onGroupByChange('')} />
                    )}
                </button>
                {showGroupBy && (
                    <div className="absolute z-30 bg-white border rounded shadow-lg w-60 max-h-screen overflow-y-auto">
                        {fields.filter(field => field.canGroup).map((field, index) => (
                            <label key={index} className="block px-4 py-1">
                                <input
                                    type="radio"
                                    name="groupBy"
                                    value={field.accessor}
                                    checked={groupBy === field.accessor}
                                    onChange={(e) => { onGroupByChange(e.target.value); setShowGroupBy(false); }}
                                    className="mr-2"
                                />
                                {field.Header}
                            </label>
                        ))}
                        <label className="block px-4 py-1">
                            <input
                                type="radio"
                                name="groupBy"
                                value=""
                                checked={groupBy === ''}
                                onChange={(e) => { onGroupByChange(e.target.value); setShowGroupBy(false); }}
                                className="mr-2"
                            />
                            ไม่จัดกลุ่ม
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GridActionBar;