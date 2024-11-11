//frontend/components/DraggableTable.js
import React, { useState } from 'react';
import DraggableItem from './DraggableItem';
const handleMoveItem = (fromIndex, toIndex) => {
    const updatedItems = [...orderedItems]; // Clone the items to avoid direct mutation
    const [movedItem] = updatedItems.splice(fromIndex, 1); // Remove the item from its current position
    updatedItems.splice(toIndex, 0, movedItem); // Insert the item at the new position

    // Update the sort_order based on the new positions
    updatedItems.forEach((item, index) => {
        item.sort_order = index + 1; // Update sort_order based on the index (starting from 1)
    });

    setOrderedItems(updatedItems); // Update the state with the reordered items
    onMoveItem(updatedItems); // Optionally pass the updated items to the parent component (for saving or other actions)
};

const DraggableTable = ({ 
    headers, 
    items, 
    mapItemToColumns, 
    onMoveItem = () => {}, 
    expandedItems = {}, 
    toggleExpand, 
    expandedContent 
}) => {


    const [orderedItems, setOrderedItems] = useState(items);

    // ฟังก์ชันนี้จะเลือกคีย์ตัวแรกที่มีค่าจาก properties ของ item
    const getItemKey = (item) => {
        // ตรวจสอบว่า item_id หรือ supplier_id หรือฟิลด์อื่นๆ มีค่า
        if (item.item_id) {
            return item.item_id; // ใช้ item_id เป็น key ถ้ามี
        }
        if (item.supplier_id) {
            return item.supplier_id; // ใช้ supplier_id เป็น key ถ้ามี
        }
        // ถ้าไม่มีทั้ง item_id และ supplier_id ให้ใช้ชื่อสินค้าหรือชื่อซัพพลายเออร์เป็น key
        return item.item_name || item.supplier_name || `key-${Math.random()}`; // ใช้ชื่อสินค้าหรือชื่อซัพพลายเออร์ หรือคีย์สุ่ม
    };
    
    const handleMoveItem = (fromIndex, toIndex) => {
        const updatedItems = [...orderedItems];
        const [movedItem] = updatedItems.splice(fromIndex, 1);
        updatedItems.splice(toIndex, 0, movedItem);

        setOrderedItems(updatedItems);
        onMoveItem(fromIndex, toIndex); // Call the function passed as prop or default to an empty function
    };

    return (
        <div className="overflow-x-auto bg-white">
            <table className="min-w-full">
                <thead>
                    <tr className="bg-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className="py-2 text-left text-gray-600 font-medium">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                {orderedItems.map((item, index) => {
                const key = getItemKey(item);  // Get unique key for each item

                const isExpanded = expandedItems && expandedItems[key] !== undefined ? expandedItems[key] : false;

                return (
                    <DraggableItem
                        key={key} // Use the dynamic key for each item
                        item={item}
                        index={index}
                        moveItem={handleMoveItem}
                        columns={mapItemToColumns(item)}
                        isExpanded={isExpanded}
                        toggleExpand={() => toggleExpand(key)} 
                        expandedContent={() => expandedContent(item)} 
                    />
                );
            })}

                </tbody>
            </table>
        </div>
    );
};

export default DraggableTable;
