//frontend/app/inventory/components/InventoryTable.js"use client";
"use client";

import React, { useMemo, useCallback } from "react";
import { useTable } from "react-table";
import { createInventoryColumns } from "./inventoryColumns";
import { useInventory } from "../hooks/useInventory";

const InventoryTable = () => {
    const { items, storeStocks, loading, error } = useInventory();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggleExpandAll = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const columns = useMemo(
        () => createInventoryColumns(isExpanded, storeStocks, toggleExpandAll),
        [isExpanded, storeStocks, toggleExpandAll]
    );

    const data = useMemo(() => items, [items]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns,
        data,
    });

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <table {...getTableProps()} className="bg-white border rounded w-full">
            <thead className="bg-gray-100 shadow-lg">
                {headerGroups.map((headerGroup) => {
                    const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <tr key={headerGroupKey} {...headerGroupProps}>
                            {headerGroup.headers.map((column) => {
                                const { key: columnKey, ...columnProps } = column.getHeaderProps();
                                return (
                                    <th
                                        key={columnKey}
                                        {...columnProps}
                                        className="p-2 font-semibold text-gray-700 text-left bg-gray-100 sticky top-0 z-30 shadow-md backdrop-blur-lg"
                                    >
                                        {column.render("Header")}
                                    </th>
                                );
                            })}
                        </tr>
                    );
                })}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    const { key: rowKey, ...rowProps } = row.getRowProps();
                    return (
                        <tr key={rowKey} {...rowProps} className="hover:bg-gray-50 transition">
                            {row.cells.map((cell) => {
                                const { key: cellKey, ...cellProps } = cell.getCellProps();
                                return (
                                    <td
                                        key={cellKey}
                                        {...cellProps}
                                        className="p-2 border-b border-r border-x-gray-200 border-y-gray-300 text-left"
                                    >
                                        {cell.render("Cell")}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default InventoryTable;