// components/DraggableTable.js
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from './DraggableItem';
import { thClass, tdClass } from '../styles/styles'; // นำเข้า styles จาก styles.js

const DraggableTable = ({
    headers,
    items,
    mapItemToColumns,
    onMoveItem,
    expandedItems = {}, // ตั้งค่าเริ่มต้นให้กับ expandedItems
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai,
    className // รับ className สำหรับตาราง
}) => {

    return (
        <DndProvider backend={HTML5Backend}>
            <table className="min-w-full border-separate border-spacing-0 ">
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr className="bg-gray-200 ">
                        <th className={`${thClass} w-5 border-r-0`}></th>
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
                                key={item.supplier_id || item.item_id}
                                item={item}
                                index={index}
                                columns={columns}
                                moveItem={onMoveItem}
                                isExpanded={expandedItems[item.supplier_id || item.item_id] || false}
                                toggleExpand={() => toggleExpand(item.supplier_id || item.item_id)}
                                expandedContent={expandedContent}
                                onCellChange={onCellChange}
                                formatDateToThai={formatDateToThai}
                            />
                        );
                    })}
                </tbody>
            </table>
        </DndProvider>
    );
};

export default DraggableTable;
