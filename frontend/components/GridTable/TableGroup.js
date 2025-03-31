// components/GridTable/TableGroup.js
import React from 'react';
import TableItem from './TableItem';

const TableGroup = ({ group, groupItems, mapItemToColumns, onMoveItem, expandedItems, toggleExpand, expandedContent, onCellChange, formatDateToThai, groupOperations, groupBy }) => {
    

    const columns = mapItemToColumns(groupItems[0], 0);

    return (
        <>
            
            {groupItems.map((item, index) => (
                <TableItem
                    key={item.id} // ใช้ item.id ที่ได้จากการแปลงข้อมูลใน page.js
                    item={item}
                    index={index}
                    mapItemToColumns={mapItemToColumns}
                    onMoveItem={onMoveItem}
                    expandedItems={expandedItems}
                    toggleExpand={toggleExpand}
                    expandedContent={expandedContent}
                    onCellChange={onCellChange}
                    formatDateToThai={formatDateToThai}
                />
            ))}
        </>
    );
};

export default TableGroup;