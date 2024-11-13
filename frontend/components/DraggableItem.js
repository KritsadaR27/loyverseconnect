// components/DraggableItem.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DotsVerticalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import InputField from './InputField';  // นำเข้า InputField

const ItemTypes = {
    ITEM: 'item',
};

const DraggableItem = ({
    item,
    index,
    columns,
    moveItem,
    isExpanded,
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai
}) => {
    const [{ isDragging }, ref] = useDrag({
        type: ItemTypes.ITEM,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: ItemTypes.ITEM,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveItem(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    const dropClass = isOver ? 'bg-blue-100 border-b-2 border-indigo-500 animate-pulse' : '';

    return (
        <>
            <tr
                ref={(node) => ref(drop(node))}
                className={`border-b ${isDragging ? 'dragging animate-pulse' : ''} ${dropClass}`}
                style={{ cursor: 'grab' }}
            >
                {columns.map((column, idx) => (
                    <td key={idx} className={`py-2 px-4 ${column.className || ''}`}>
                        {idx === 0 && <DotsVerticalIcon className="h-5 w-5 text-gray-400 mr-3" />}
                        
                        {/* ใช้ InputField สำหรับการแสดงผลข้อมูล */}
                        <InputField
                            type={column.type}  // type จาก columns
                            value={item[column.label]} 
                            onChange={(e) => onCellChange(item.id, column.label, e.target.value)} 
                            options={column.options}  // ถ้ามี options เช่น สำหรับ select
                            formatDateToThai={formatDateToThai}
                        />
                        {idx === 0 && (
                            <button onClick={toggleExpand} className="ml-2">
                                {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
                            </button>
                        )}
                    </td>
                ))}
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={columns.length} className="bg-gray-50 p-3">
                        {expandedContent(item)}
                    </td>
                </tr>
            )}
        </>
    );
};

export default DraggableItem;
