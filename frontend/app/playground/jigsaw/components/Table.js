// /app/playground/jigsaw/components/Table.js

"use client";

import React, { forwardRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const Table = forwardRef(({ data, searchTerm, currentIndex, toggleGroup, expandedGroups = {}, expandAllGroups, collapseAllGroups }, ref) => {
    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={index} className="bg-yellow-300">{part}</span>
            ) : (
                part
            )
        );
    };

    return (
        <div>
            <div className="flex justify-end mb-2">
                <button onClick={expandAllGroups} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Expand All</button>
                <button onClick={collapseAllGroups} className="px-4 py-2 bg-blue-500 text-white rounded">Collapse All</button>
            </div>
            <table ref={ref} className="min-w-full bg-white border border-gray-300 mt-4">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Category</th>
                        <th className="py-2 px-4 border-b">Store</th>
                        <th className="py-2 px-4 border-b">Supplier</th>
                        <th className="py-2 px-4 border-b">In Stock</th>
                        <th className="py-2 px-4 border-b">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((group) => (
                        <React.Fragment key={group}>
                            <tr className="bg-gray-200 cursor-pointer" onClick={() => toggleGroup(group)}>
                                <td colSpan="6" className="py-2 px-4 border-b flex items-center">
                                    {expandedGroups[group] ? (
                                        <ChevronUpIcon className="h-5 w-5 mr-2" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 mr-2" />
                                    )}
                                    {group} ({data[group].length})
                                </td>
                            </tr>
                            {expandedGroups[group] && data[group].map((item, index) => (
                                <tr key={`${group}-${item.item_id}-${index}`} className={item.item_id === data[currentIndex]?.item_id ? "bg-blue-100" : ""}>
                                    <td className="py-2 px-4 border-b">{highlightText(item.item_name, searchTerm)}</td>
                                    <td className="py-2 px-4 border-b">{item.category_name}</td>
                                    <td className="py-2 px-4 border-b">{item.store_name}</td>
                                    <td className="py-2 px-4 border-b">{item.supplier_name}</td>
                                    <td className="py-2 px-4 border-b">{item.in_stock}</td>
                                    <td className="py-2 px-4 border-b">{item.selling_price}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default Table;
