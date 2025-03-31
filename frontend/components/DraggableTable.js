// components/DraggableTable.js
import React, { useState } from 'react';
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
    const [selectedItems, setSelectedItems] = useState([]);

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.supplier_id || item.item_id));
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prevSelectedItems =>
            prevSelectedItems.includes(id)
                ? prevSelectedItems.filter(item => item !== id)
                : [...prevSelectedItems, id]
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <table className="min-w-full border-separate border-spacing-0 ">
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr className="bg-gray-200 ">
                    <th className={`${thClass} w-5 border-r-0`}></th>

                        <th className={`${thClass} w-5 border-r-0`}>
                            <input
                                type="checkbox"
                                checked={selectedItems.length === items.length}
                                onChange={handleSelectAll}
                                className="form-checkbox  text-blue-600"
                            />
                        </th>


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
                        const itemId = item.supplier_id || item.item_id;
                        return (
                            <DraggableItem
                                key={itemId}
                                item={item}
                                index={index}
                                columns={columns}
                                moveItem={onMoveItem}
                                isExpanded={expandedItems[itemId] || false}
                                toggleExpand={() => toggleExpand(itemId)}
                                expandedContent={expandedContent}
                                onCellChange={onCellChange}
                                formatDateToThai={formatDateToThai}
                                isSelected={selectedItems.includes(itemId)}
                                onSelectItem={() => handleSelectItem(itemId)}
                            />
                        );
                    })}
                </tbody>
            </table>
        </DndProvider>
    );
};

export default DraggableTable;
