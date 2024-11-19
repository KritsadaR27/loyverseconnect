//frontend/app/inventory/components/inventoryColumns.js
export const createInventoryColumns = (isExpanded = false, storeStocks = {}, toggleExpandAll = () => { }) => {
    const baseColumnsBefore = [{ Header: "ชื่อสินค้า", accessor: "item_name", className: "min-w-[150px]" }];

    const summaryColumn = {
        Header: (
            <div className="flex justify-between">
                <span>รวม</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandAll();
                    }}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                    {isExpanded ? "←" : "→"}
                </button>
            </div>
        ),
        accessor: "in_stock",
        Cell: ({ value }) => new Intl.NumberFormat("th-TH").format(value),
    };

    const storeColumns = isExpanded
        ? Array.from(
            new Set(
                Object.values(storeStocks).flatMap((stores) =>
                    stores.map((store) => store.store_name)
                )
            )
        ).map((storeName) => ({
            Header: storeName.replace("ลุงรวย สาขา", ""), // ตัดคำว่า "ลุงรวย สาขา" ออก
            id: `store-${storeName}`, // เพิ่ม id เพื่อให้ไม่ซ้ำกัน
            accessor: (row) => {
                const storeStock = storeStocks[row.item_id]?.find(
                    (store) => store.store_name === storeName

                );
                return storeStock ? storeStock.in_stock : 0;
            },
            Cell: ({ value }) => (
                <div className="bg-yellow-50 text-center py-2 font-bold">
                    {new Intl.NumberFormat("th-TH").format(value)}
                </div>
            ),
        }))
        : [];

    const baseColumnsAfter = [
        {
            Header: "ราคาขาย", accessor: "selling_price", Cell: ({ value }) => `฿${new Intl.NumberFormat("th-TH").format(value)}`
        },
        { Header: "ต้นทุน", accessor: "cost", Cell: ({ value }) => `฿${new Intl.NumberFormat("th-TH").format(value)}` },
        {
            Header: "มูลค่าขาย", accessor: "value", Cell: ({ row }) => {
                const value = row.original.selling_price * row.original.in_stock;
                return new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                    minimumFractionDigits: 0
                }).format(value); // Calculate and format as Thai Baht
            },
        },
        { Header: "หมวดหมู่", accessor: "category_name" },
        { Header: "ซัพพลายเออร์", accessor: "supplier_name" },
    ];

    return [...baseColumnsBefore, summaryColumn, ...storeColumns, ...baseColumnsAfter];
};
