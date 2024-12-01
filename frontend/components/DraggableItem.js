// components/DraggableItem.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Bars3Icon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
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
    const ref = React.useRef(null);

    const [{ isDragging }, drag] = useDrag({
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

    drag(drop(ref));

    const dropClass = isOver ? 'bg-blue-100 border-b-2 border-indigo-500 animate-pulse' : '';
    const tdClass = "border-r border-b border-gray-300 text-gray-700 p-0"; // ลบ padding

    return (
        <>
            <tr
                ref={ref}
                className={`border-b ${isDragging ? 'dragging animate-pulse' : ''} ${dropClass}`}
                style={{ cursor: 'grab' }}
            >
                {columns.map((column, idx) => (
                    <td key={idx} className={`${tdClass} ${column.className || ''}`}>
                        {idx === 0 && <Bars3Icon className="h-5 w-5 text-gray-400 mr-3 float-left" />}

                        {/* ใช้ InputField สำหรับการแสดงผลข้อมูล */}
                        <InputField
                            type={column.type}  // type จาก columns
                            value={column.value}
                            onChange={(e) => onCellChange(item.id, column.label, e.target.value)}
                            options={column.options}  // ถ้ามี options เช่น สำหรับ select
                            formatDateToThai={formatDateToThai}
                            dateCycle={column.dateCycle}
                            selectedDays={column.selectedDays}
                            onSelectChange={column.onSelectChange}
                            onDaysChange={column.onDaysChange}
                            icon={column.icon} // เพิ่ม prop สำหรับไอคอน
                            onClick={column.onClick} // เพิ่ม prop สำหรับ onClick
                            className={column.className} // เพิ่ม prop สำหรับ className
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
