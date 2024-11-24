// src/app/inventory/components/InventoryActionBar.js
import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon, BuildingStorefrontIcon as StoreIcon, XMarkIcon, AdjustmentsHorizontalIcon as GroupIcon, MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';

const InventoryActionBar = ({ filterText, filterInventory, groupBy, setGroupBy, categories, selectedCategories, setSelectedCategories, suppliers, selectedSuppliers, setSelectedSuppliers, toggleShowStoreStocks, showStoreStocks }) => {
  const [searchTerm, setSearchTerm] = useState(filterText);
  const [showCategories, setShowCategories] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const categoriesRef = useRef(null);
  const suppliersRef = useRef(null);
  const groupByRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
      if (suppliersRef.current && !suppliersRef.current.contains(event.target)) {
        setShowSuppliers(false);
      }
      if (groupByRef.current && !groupByRef.current.contains(event.target)) {
        setShowGroupBy(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterInventory(value); // เรียกฟังก์ชัน filterInventory เมื่อผู้ใช้พิมพ์ข้อความ
  };

  const clearSearch = () => {
    setSearchTerm("");
    filterInventory("");
  };

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  const toggleSuppliers = () => {
    setShowSuppliers(!showSuppliers);
  };

  const toggleGroupBy = () => {
    setShowGroupBy(!showGroupBy);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSupplierChange = (supplier) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplier) ? prev.filter((s) => s !== supplier) : [...prev, supplier]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const clearSuppliers = () => {
    setSelectedSuppliers([]);
  };

  const selectAllCategories = () => {
    setSelectedCategories(categories.map(category => category.name));
  };

  const selectAllSuppliers = () => {
    setSelectedSuppliers(suppliers.map(supplier => supplier.name));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between py-1.5 rounded-md">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-shrink-0 items-center space-x-2" ref={categoriesRef}>
            <button onClick={toggleCategories} className={`px-4 py-1 text-black rounded border ${selectedCategories.length > 0 ? 'bg-blue-600 text-white' : 'bg-white'} ${showCategories ? 'border-2 border-blue-500' : ''}`}>
              {selectedCategories.length > 0 ? `เลือก ${selectedCategories.length} หมวดหมู่` : "ทุกหมวดหมู่"} <ChevronDownIcon className="h-5 w-5 inline" />
            </button>
            {showCategories && (
              <div className="absolute z-30 bg-white border rounded shadow-lg w-60 max-h-2/3 overflow-y-auto">
                <input
                  type="text"
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  placeholder="ค้นหาหมวดหมู่..."
                  className="border border-gray-300 w-full px-2 py-1 mb-2"
                />
                {filteredCategories.map((category) => (
                  <label key={category.id} className="block px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryChange(category.name)}
                      className="mr-2"
                    />
                    {category.name}
                  </label>
                ))}
                <button onClick={selectAllCategories} className="block w-full text-left px-4 py-1 text-blue-500">
                  เลือกทั้งหมด
                </button>
                {selectedCategories.length > 0 && (
                  <button onClick={clearCategories} className="block w-full text-left px-4 py-1 text-red-500">
                    ไม่เลือก
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="relative flex-shrink-0 items-center space-x-2" ref={suppliersRef}>
            <button onClick={toggleSuppliers} className={`px-4 py-1 text-black rounded border ${selectedSuppliers.length > 0 ? 'bg-blue-600 text-white' : 'bg-white'} ${showSuppliers ? 'border-2 border-blue-500' : ''}`}>
              {selectedSuppliers.length > 0 ? `เลือก ${selectedSuppliers.length} ผู้จำหน่าย` : "ทุกผู้จำหน่าย"} <ChevronDownIcon className="h-5 w-5 inline" />
            </button>
            {showSuppliers && (
              <div className="absolute z-30 bg-white border shadow-lg w-60 max-h-2/3 overflow-y-auto">
                <input
                  type="text"
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
                  placeholder="ค้นหาผู้จำหน่าย..."
                  className="border border-gray-300 rounded-md w-full px-2 py-1 mb-2"
                />
                {filteredSuppliers.map((supplier) => (
                  <label key={supplier.id} className="block px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.name)}
                      onChange={() => handleSupplierChange(supplier.name)}
                      className="mr-2"
                    />
                    {supplier.name}
                  </label>
                ))}
                <button onClick={selectAllSuppliers} className="block w-full text-left px-4 py-1 text-blue-500">
                  เลือกทั้งหมด
                </button>
                {selectedSuppliers.length > 0 && (
                  <button onClick={clearSuppliers} className="block w-full text-left px-4 py-1 text-red-500">
                    ไม่เลือก
                  </button>
                )}
              </div>
            )}
          </div>
          <button onClick={toggleShowStoreStocks} className={`ml-4 px-4 py-1 text-black rounded border ${showStoreStocks ? 'bg-yellow-200' : 'bg-gray-200'}`}>
            <StoreIcon className="h-5 w-5 inline" /> {showStoreStocks ? "ปิด" : "ดูสาขา"}
          </button>
          <div className="relative flex-shrink-0 items-center space-x-2" ref={groupByRef}>
            <button onClick={toggleGroupBy} className={`bg-gray-200 px-4 py-1 rounded border hover:bg-gray-300 transition ${groupBy ? 'bg-green-500 text-white' : ''} ${showGroupBy ? 'border-2 border-blue-500' : ''}`}>
              <GroupIcon className="h-5 w-5 inline" /> {groupBy ? `จัดกลุ่ม ${groupBy === 'category_name' ? 'หมวดหมู่' : 'ผู้จำหน่าย'}` : 'จัดกลุ่ม'}
              {groupBy && (
                <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setGroupBy('')} />
              )}
            </button>
            {showGroupBy && (
              <div className="absolute z-30 bg-white border rounded shadow-lg w-60 max-h-2/3 overflow-y-auto">
                <label className="block px-4 py-1">
                  <input
                    type="radio"
                    name="groupBy"
                    value="category_name"
                    checked={groupBy === 'category_name'}
                    onChange={(e) => { setGroupBy(e.target.value); setShowGroupBy(false); }}
                    className="mr-2"
                  />
                  หมวดหมู่
                </label>
                <label className="block px-4 py-1">
                  <input
                    type="radio"
                    name="groupBy"
                    value="supplier_name"
                    checked={groupBy === 'supplier_name'}
                    onChange={(e) => { setGroupBy(e.target.value); setShowGroupBy(false); }}
                    className="mr-2"
                  />
                  ผู้จำหน่าย
                </label>
                <label className="block px-4 py-1">
                  <input
                    type="radio"
                    name="groupBy"
                    value=""
                    checked={groupBy === ''}
                    onChange={(e) => { setGroupBy(e.target.value); setShowGroupBy(false); }}
                    className="mr-2"
                  />
                  ไม่จัดกลุ่ม
                </label>
              </div>
            )}
          </div>
        </div>
        {/* Right Section */}
        <div className="relative flex-shrink-0 items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleChange}
              placeholder="ค้นหาสินค้า..."
              className="border border-gray-300 rounded-md pl-8 pr-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="absolute right-2 top-2 w-4 h-4 text-gray-500">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            <SearchIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
      {/* Selected Categories and Suppliers */}
      {(selectedCategories.length > 0 || selectedSuppliers.length > 0) && (
        <div className="flex items-center bg-blue-100 rounded py-2 px-3 border">
          {selectedCategories.length > 0 && (
            <>
              <span className="bg-yellow-300 p-1 rounded-md">หมวดหมู่:</span>
              {selectedCategories.map((category) => (
                <div key={category} className="flex items-center bg-blue-500 text-white font-bold mx-1 px-2 py-1 rounded-full text-sm">
                  {category} <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => handleCategoryChange(category)} />
                </div>
              ))}
            </>
          )}
          {selectedSuppliers.length > 0 && (
            <>
              <span className="bg-yellow-300 p-1 rounded-md ml-3">ผู้จำหน่าย:</span>
              {selectedSuppliers.map((supplier) => (
                <div key={supplier} className="flex items-center bg-blue-500 text-white font-bold mx-1 px-2 py-1 rounded-full text-sm">
                  {supplier} <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => handleSupplierChange(supplier)} />
                </div>
              ))}
            </>
          )}
          <button onClick={() => { clearCategories(); clearSuppliers(); }} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm ml-auto">
            ยกเลิกกรอง
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryActionBar;