const ActionBar = () => {
    return (
      <div className="flex items-center justify-between bg-white  p-4 rounded-md">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Store Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="store" className="text-sm font-medium">
              Store
            </label>
            <select
              id="store"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Stores</option>
              <option value="store1">Store 1</option>
              <option value="store2">Store 2</option>
            </select>
          </div>
  
          {/* Supplier Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="supplier" className="text-sm font-medium">
              Supplier
            </label>
            <select
              id="supplier"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Suppliers</option>
              <option value="supplier1">Supplier 1</option>
              <option value="supplier2">Supplier 2</option>
            </select>
          </div>
  
          {/* Category Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="category1">Category 1</option>
              <option value="category2">Category 2</option>
            </select>
          </div>
        </div>
  
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Group Button */}
          <button className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 transition">
            Group
          </button>
  
          {/* Filter Button */}
          <button className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 transition">
            Filter
          </button>
  
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded-md pl-8 pr-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-2 top-2.5 w-4 h-4 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };
  
  export default ActionBar;
  