//frontend/app/inventory/components/InventoryActionBar.js
"use client";

const InventoryActionBar = () => {
  return (
    <div className="flex items-center justify-between  py-1.5 rounded-md">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Store Selector */}
        <div className="flex items-center space-x-2">

          <select
            id="supplier"
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">ผู้จำหน่ายทั้งหมด</option>
            <option value="supplier1">Supplier 1</option>
            <option value="supplier2">Supplier 2</option>
          </select>
        </div>
      </div>


    </div>
  );
};

export default InventoryActionBar;
