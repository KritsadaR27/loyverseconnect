// components/table/TableItem.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ArrowsUpDownIcon } from '@heroicons/react/24/solid';
import GridInputField from '../GridInputField';  // นำเข้า GridInputField
import { gridHoverClass } from '../../styles/styles'; // นำเข้า styles จาก styles.js

const ItemTypes = {
    ITEM: 'item',
};

const TableItem = ({
    item,
    index,
    columns = [], // ตั้งค่าเริ่มต้นให้กับ columns
    moveItem,
    isExpanded,
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai,
    isSelected,
    onSelectRow
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
    const tdClass = "border-r border-b border-gray-300 text-gray-700 p-0 whitespace-nowrap"; 

    return (
        <>
            <tr
                ref={ref}
                className={`
                    group border-b 
                    ${gridHoverClass}
                    ${isDragging ? 'dragging animate-pulse' : ''} 
                    ${dropClass} ${isSelected ? 'bg-blue-100' : ''}
                    
                    `}
                style={{ cursor: 'grab' }}
            >    
                <td className={`${tdClass} ${gridHoverClass} border-r-0 w-5 relative`}>
                    <ArrowsUpDownIcon
                        className="h-5 w-5 items-center text-gray-400 hidden group-hover:block group-hover:text-blue-500 hover:cursor-move absolute left-0 top-1/2 transform -translate-y-1/2 transition duration-200"
                    />
                </td>
                <td className={`${tdClass} ${gridHoverClass} border-r-0 w-5 relative`}>
                    <input
                        className="items-center absolute top-2 left-1/2 transform -translate-x-1/2"
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow(item.id, index, e.shiftKey)}
                    />
                </td>
                {columns.map((column, idx) => (
                    <td key={idx} className={`${tdClass} ${gridHoverClass} ${column.tdClassName || ''}`}>
                        {column.type === 'custom' ? (
                            column.render()
                        ) : (
                            <GridInputField
                                type={column.type}  // type จาก columns
                                value={column.value}
                                onChange={column.onChange} // ตรวจสอบว่ามีการเรียกใช้ onCellChange
                                options={column.options}  // ถ้ามี options เช่น สำหรับ select
                                readOnly={column.readOnly}
                                className={`${column.inputClassName} ${isSelected ? 'bg-blue-100' : ''}`} // ส่ง inputClassName ไปยัง InputField
                                
                            />
                        )}
                    </td>
                ))}
            </tr>
        </>
    );
};

export default TableItem;