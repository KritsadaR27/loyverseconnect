// components/table/TableFoot.js
import React from 'react';

const TableFoot = ({ items, mapItemToColumns, groupOperations }) => {
    const calculateGroupValue = (items, field, operation) => {
        switch (operation) {
            case 'sum':
                return items.reduce((acc, item) => acc + (item[field] || 0), 0);
            case 'count':
                return items.length;
            case 'average':
                return items.reduce((acc, item) => acc + (item[field] || 0), 0) / items.length;
            default:
                return '';
        }
    };

    const columns = mapItemToColumns(items[0], 0);

    return (
        <tfoot className="bg-gray-100">
            <tr>
                {columns.map((column, idx) => (
                    <td key={idx} className={column.tdClassName}>
                        {groupOperations[column.accessor] ? calculateGroupValue(items, column.accessor, groupOperations[column.accessor]) : ''}
                    </td>
                ))}
            </tr>
        </tfoot>
    );
};

export default TableFoot;