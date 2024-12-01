// components/DraggableRow.js
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
    ROW: 'row',
};

const DraggableRow = ({ item, index, moveRow, columns }) => {
    const ref = React.useRef(null);

    const [, drop] = useDrop({
        accept: ItemTypes.ROW,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveRow(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.ROW,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <tr ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {columns && columns.map((column, idx) => (
                <td key={idx} className="border p-2">
                    {item[column]}
                </td>
            ))}
        </tr>
    );
};

export default DraggableRow;