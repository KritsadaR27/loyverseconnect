import React, { useState } from 'react';
import DraggableItem from './DraggableItem';

const DraggableTable = ({ 
    headers, 
    items, 
    mapItemToColumns, 
    onMoveItem = () => {}, // Default function if onMoveItem is not provided
    expandedItems = {}, 
    toggleExpand, 
    expandedContent, 
    reserveValues 
}) => {
    const [orderedItems, setOrderedItems] = useState(items);

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
                    {orderedItems.map((item, index) => (
                        <DraggableItem
                            key={item.item_id || index}
                            item={item}
                            index={index}
                            moveItem={handleMoveItem}
                            columns={mapItemToColumns(item)}
                            isExpanded={expandedItems[item.item_id] || false} // เปลี่ยนจาก item_name เป็น item_id
                            toggleExpand={() => toggleExpand(item.item_id)} // ส่ง item_id แทน item_name
                            expandedContent={() => expandedContent(item)} // ส่ง item ทั้งหมดไปยัง expandedContent
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DraggableTable;
