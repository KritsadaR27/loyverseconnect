// components/DraggableTable.js
import DraggableItem from './DraggableItem';

const DraggableTable = ({
    headers,
    items,
    mapItemToColumns,
    onMoveItem,
    expandedItems,
    toggleExpand,
    expandedContent,
    onCellChange,
    formatDateToThai,
    className // รับ className สำหรับตาราง
}) => {
    return (
        <div className={`overflow-x-auto bg-white ${className}`}>
            <table className="min-w-full border-separate border-spacing-0">
                <thead>
                    <tr className="bg-gray-200">
                        {headers.map((header, index) => (
                            <th key={index} className="py-2 text-left text-gray-600 font-medium border-r border-gray-300">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        const columns = mapItemToColumns(item);
                        return (
                            <DraggableItem
                                key={item.id}
                                item={item}
                                index={index}
                                columns={columns}
                                moveItem={onMoveItem}
                                isExpanded={expandedItems[item.id] || false}
                                toggleExpand={toggleExpand}
                                expandedContent={expandedContent}
                                onCellChange={onCellChange}
                                formatDateToThai={formatDateToThai}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default DraggableTable;
