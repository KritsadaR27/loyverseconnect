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
    columns = [], // ตั้งค่าเริ่มต้นให้กับ columns
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
                    <td key={idx} className={`${tdClass} ${column.tdClassName || ''}`}>
                        {/* {idx === 0 && <Bars3Icon className="h-5 w-5 text-gray-400 mr-3 float-left" />} */}

                        {column.type === 'custom' ? (
                            column.render()
                        ) : (
                            <InputField
                                type={column.type}  // type จาก columns
                                value={column.value}
                                onChange={column.onChange} // ตรวจสอบว่ามีการเรียกใช้ onCellChange
                                options={column.options}  // ถ้ามี options เช่น สำหรับ select
                                readOnly={column.readOnly}
                                className={column.inputClassName} // ส่ง inputClassName ไปยัง InputField
                            />
                        )}
                    </td>
                ))}
            </tr>
        </>
    );
};

export default DraggableItem;
