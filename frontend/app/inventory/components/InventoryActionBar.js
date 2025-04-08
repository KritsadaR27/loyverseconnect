// src/app/inventory/components/InventoryActionBar.js
import React, { memo } from "react";
import { ChevronDownIcon, ChevronUpIcon, BuildingStorefrontIcon as StoreIcon, XMarkIcon, AdjustmentsHorizontalIcon as GroupIcon, MagnifyingGlassIcon as SearchIcon, ShoppingCartIcon as OrderIcon, ArrowPathIcon as SyncIcon } from '@heroicons/react/24/outline';
import Alert from '../../../components/Alert';
import MultiSelect from '../../../components/MultiSelect';
import useInventoryActionBar from '../hooks/useInventoryActionBar';

const InventoryActionBar = ({ filterText, filterInventory, groupBy, setGroupBy, categories, selectedCategories, setSelectedCategories, suppliers, selectedSuppliers, setSelectedSuppliers, toggleShowStoreStocks, showStoreStocks, showFriendOrder, setShowFriendOrder }) => {
  const {
    searchTerm,
    setSearchTerm,
    showCategories,
    setShowCategories,
    showSuppliers,
    setShowSuppliers,
    showGroupBy,
    setShowGroupBy,
    showSearchInput,
    setShowSearchInput,
    categorySearchTerm,
    setCategorySearchTerm,
    supplierSearchTerm,
    setSupplierSearchTerm,
    alert,
    setAlert,
    isLoading,
    setIsLoading,
    categoriesRef,
    suppliersRef,
    groupByRef,
    searchInputRef,
    handleCategoryChange,
    handleSupplierChange,
    clearCategories,
    clearSuppliers,
    selectAllCategories,
    selectAllSuppliers,
    handleFriendOrderToggle,
    handleFriendOrderCancel,
    handleSync,
    toggleGroupBy,
    toggleSearchInput,
  } = useInventoryActionBar(setSelectedCategories, setSelectedSuppliers, toggleShowStoreStocks, setGroupBy, showFriendOrder, setShowFriendOrder, categories, suppliers);

  const handleChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterInventory(value); // เรียกฟังก์ชัน filterInventory เมื่อผู้ใช้พิมพ์ข้อความ
  };

  const clearSearch = () => {
    setSearchTerm("");
    filterInventory("");
  };

  const handleSyncClick = () => {
    const apiUrl = process.env.NEXT_PUBLIC_LOYVERSE_CONNECT_BASE_URL;
    handleSync(`${apiUrl}/api/sync-inventory-levels`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );

  return (
    <div>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="flex items-center justify-between py-1.5 rounded-md " style={{ maxWidth: '100vw' }}>
        {/* Left Section */}
        <div className="flex items-center space-x-5">
          <MultiSelect
            title="หมวดหมู่"
            items={categories}
            selectedItems={selectedCategories}
            toggleItem={handleCategoryChange}
            onClear={clearCategories}
            onSelectAll={selectAllCategories}
          />

          <MultiSelect
            title="ผู้จำหน่าย"
            items={suppliers}
            selectedItems={selectedSuppliers}
            toggleItem={handleSupplierChange}
            onClear={clearSuppliers}
            onSelectAll={selectAllSuppliers}
          />

          <button onClick={toggleShowStoreStocks} className={`flex items-center ml-4 px-2 py-1 text-black rounded border ${showStoreStocks ? 'bg-yellow-300' : 'bg-gray-200'}`}>
            <StoreIcon className="h-5 w-5 mr-1 inline" /> <span className="hidden sm:inline">ดูสาขา</span>
            {showStoreStocks && (
              <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={toggleShowStoreStocks} />
            )}
          </button>
          <button onClick={handleFriendOrderToggle} className={`flex items-center ml-4 px-2 py-1 text-black rounded border ${showFriendOrder ? 'bg-pink-300' : 'bg-gray-200'}`}>
            <OrderIcon className="h-5 w-5 mr-1 inline" /> <span className="hidden sm:inline">ดูเพื่อสั่ง</span>
            {showFriendOrder && (
              <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={handleFriendOrderCancel} />
            )}
          </button>
          <button
            onClick={handleSyncClick}
            className={`px-2 py-1 rounded-md  transition duration-200 ${isLoading ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          >
            <SyncIcon className={`h-5 w-5 mr-1 inline ${isLoading ? 'animate-spin' : ''}`} /> <span className="hidden sm:inline">ซิงค์</span>
          </button>
          <div className="relative flex-shrink-0 items-center space-x-2" ref={groupByRef}>
            <button onClick={toggleGroupBy} className={`flex items-center bg-gray-200 px-4 py-1 rounded border hover:bg-gray-300 transition ${groupBy ? 'bg-green-600 text-white' : ''} ${showGroupBy ? 'border-2 border-blue-500' : ''}`}>
              <GroupIcon className="h-5 w-5 mr-1 inline" /> <span className="hidden sm:inline">{groupBy ? `จัดกลุ่ม ${groupBy === 'category_name' ? 'หมวดหมู่' : 'ผู้จำหน่าย'}` : 'จัดกลุ่ม'}</span>
              {groupBy && (
                <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setGroupBy('')} />
              )}
            </button>
            {showGroupBy && (
              <div className="absolute z-30 bg-white border rounded shadow-lg w-60 max-h-screen	 overflow-y-auto">
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
        <div className="relative flex-shrink-0 items-center space-x-1">
          {/* Search Input */}
          <div className="relative" ref={searchInputRef}>
            {showSearchInput ? (
              <>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleChange}
                  placeholder="ค้นหาสินค้า..."
                  className="border border-gray-300 rounded-md pl-8 pr-0 py-1 text-sm h-9 focus:ring-blue-500 focus:border-blue-500 w-60"
                />
                {searchTerm && (
                  <button onClick={clearSearch} className="absolute right-2 top-2 w-4 h-4 text-gray-500">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
                <SearchIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
              </>
            ) : (
              <button onClick={toggleSearchInput} className="p-2">
                <SearchIcon className="w-6 h-6 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Selected Categories and Suppliers */}
      {(selectedCategories.length > 0 || selectedSuppliers.length > 0) && (
        <div className="flex items-center rounded py-2 px-3 border">
          {selectedCategories.length > 0 && (
            <>
              <span className="bg-yellow-300 p-1 rounded-md">หมวดหมู่:</span>
              {selectedCategories.map((category) => (
                <div key={category} className="flex items-center bg-blue-200 text-blue-800 font-bold mx-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ">
                  {category} <XMarkIcon className="w-4 h-4 ml-1 cursor-pointer" onClick={() => handleCategoryChange(category)} />
                </div>
              ))}
            </>
          )}
          {selectedSuppliers.length > 0 && (
            <>
              <span className="bg-yellow-300 p-1 rounded-md ml-3">ผู้จำหน่าย:</span>
              {selectedSuppliers.map((supplier) => (
                <div key={supplier} className="flex items-center bg-blue-200 text-blue-800 font-bold mx-1 px-2 py-1 rounded-full text-xs whitespace-nowrap">
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

export default memo(InventoryActionBar);