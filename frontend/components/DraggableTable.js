// components/DraggableTable.js
import React from 'react';
import DraggableItem from './DraggableItem';

const DraggableTable = ({
    headers,
    items,
    mapItemToColumns,
    onMoveItem,
    expandedItems,
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai,
    className // รับ className สำหรับตาราง
}) => {
    const thClass = "p-2 font-semibold text-gray-700 text-left bg-gray-100 shadow-md border-r border-gray-300 resize-handle";

    return (
        <div>
            <table className="min-w-full border-separate border-spacing-0">
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr className="bg-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className={`${thClass}`}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const columns = mapItemToColumns(item);
                        return (
                            <DraggableItem
                                key={`${item.id}-${index}`} // ใช้ item.id และ index ร่วมกันเพื่อสร้าง key ที่เป็นเอกลักษณ์
                                item={item}
                                index={index}
                                columns={columns}
                                moveItem={onMoveItem}
                                isExpanded={expandedItems[item.id] || false}
                                toggleExpand={() => toggleExpand(item.id)}
                                expandedContent={expandedContent}
                                onCellChange={onCellChange}
                                formatDateToThai={formatDateToThai}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DraggableTable;
