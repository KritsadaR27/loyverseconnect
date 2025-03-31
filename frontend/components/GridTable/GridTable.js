// components/GridTable/GridTable.js
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TableHead from './TableHead';
import TableItem from './TableItem';
import TableGroup from './TableGroup';
import TableFoot from './TableFoot';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const GridTable = ({
    headers,
    items,
    mapItemToColumns,
    onMoveItem,
    expandedItems = {}, // ตั้งค่าเริ่มต้นให้กับ expandedItems
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai,
    inputRefs,
    highlightedItemId,
    className, // รับ className สำหรับตาราง
    groupBy, // รับ groupBy สำหรับการจัดกลุ่ม
    groupOperations // รับ groupOperations สำหรับการกำหนดการคำนวณในแต่ละ field
}) => {
    const [isExpanded, setIsExpanded] = useState({});
    const [selectedItems, setSelectedItems] = useState([]);
    const groupedItems = groupBy ? items.reduce((acc, item) => {
        const group = item[groupBy];
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {}) : { '': items };

    const toggleExpandGroup = (group) => {
        setIsExpanded((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    const expandAllGroups = () => {
        const expandedGroups = Object.keys(groupedItems).reduce((acc, group) => {
            acc[group] = true;
            return acc;
        }, {});
        setIsExpanded(expandedGroups);
    };

    const collapseAllGroups = () => {
        const collapsedGroups = Object.keys(groupedItems).reduce((acc, group) => {
            acc[group] = false;
            return acc;
        }, {});
        setIsExpanded(collapsedGroups);
    };

    const selectAllItems = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.id));
        }
    };

    const calculateGroupValue = (items, field, operation) => {
        const numericItems = items.filter(item => typeof item[field] === 'number');
        switch (operation) {
            case 'sum':
                return numericItems.reduce((acc, item) => acc + (item[field] || 0), 0);
            case 'count':
                return numericItems.length;
            case 'average':
                return numericItems.reduce((acc, item) => acc + (item[field] || 0), 0) / numericItems.length;
            default:
                return '';
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <table className="min-w-full border-separate border-spacing-0">
                <TableHead
                    headers={headers}
                    onExpandAll={expandAllGroups}
                    onCollapseAll={collapseAllGroups}
                    onSelectAll={selectAllItems}
                    isAllSelected={selectedItems.length === items.length}
                    groupBy={groupBy}
                />
                <tbody>
                    {Object.entries(groupedItems).map(([group, groupItems], groupIndex) => (
                        <React.Fragment key={groupIndex}>
                            {group && groupBy && (
                                <tr onClick={() => toggleExpandGroup(group)}>
                                    <td className="bg-gray-200 text-left p-2 cursor-pointer">
                                        {isExpanded[group] ? <ChevronDownIcon className="h-5 w-5 inline" /> : <ChevronRightIcon className="h-5 w-5 inline" />} {group} ({groupItems.length})
                                    </td>
                                    {mapItemToColumns(groupItems[0], 0).map((column, idx) => (
                                        <td key={idx} className={column.tdClassName}>
                                            {groupOperations[column.accessor] ? calculateGroupValue(groupItems, column.accessor, groupOperations[column.accessor]) : ''}
                                        </td>
                                    ))}
                                </tr>
                            )}
                            {(!groupBy || isExpanded[group]) && (
                                groupItems.map((item, index) => (
                                    <TableItem
                                        key={item.id}
                                        item={item}
                                        index={index}
                                        columns={mapItemToColumns(item, index)}
                                        moveItem={onMoveItem}
                                        isExpanded={expandedItems[item.id] || false}
                                        toggleExpand={() => toggleExpand(item.id)}
                                        expandedContent={expandedContent}
                                        onCellChange={onCellChange}
                                        formatDateToThai={formatDateToThai}
                                        isSelected={selectedItems.includes(item.id)}
                                        onSelectRow={(id, index, shiftKey) => {
                                            if (shiftKey) {
                                                const start = Math.min(index, selectedItems[selectedItems.length - 1]);
                                                const end = Math.max(index, selectedItems[selectedItems.length - 1]);
                                                const newSelectedItems = items.slice(start, end + 1).map(item => item.id);
                                                setSelectedItems([...new Set([...selectedItems, ...newSelectedItems])]);
                                            } else {
                                                setSelectedItems(prevSelectedItems =>
                                                    prevSelectedItems.includes(id)
                                                        ? prevSelectedItems.filter(item => item !== id)
                                                        : [...prevSelectedItems, id]
                                                );
                                            }
                                        }}
                                    />
                                ))
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
                <TableFoot items={items} mapItemToColumns={mapItemToColumns} groupOperations={groupOperations} />
            </table>
        </DndProvider>
    );
};

export default GridTable;