// components/SupplierSettingsTable.js
import React from 'react';
import DraggableTable from '../../../../components/DraggableTable';

const SupplierSettingsTable = ({
    suppliers,
    groupedItems,
    expandedItems,
    toggleExpand,
    handleInputChange,
    handleItemInputChange,
    moveSupplier,
    inputRefs,
    highlightedSupplierId
}) => {
    const mapSupplierToColumns = (supplier) => [
        
        {
            type: 'text',
            label: 'supplier_name',
            value: supplier.supplier_name,
            readOnly: true,
            tdClassName: 'flex',
        },
        {
            type: 'datefilter',
            label: 'order_cycle_and_days',
            value: supplier.order_cycle,
            selectedDays: supplier.selected_days,
            defaultDays: supplier.selected_days, // ส่งค่า selected_days ไป
            // inputClassName: 'flex-1 group-hover:bg-blue-100 group-hover:border-blue-100',

            onSelectChange: (value) => handleInputChange(supplier.supplier_id, 'order_cycle', value),
            onDaysChange: (days) => handleInputChange(supplier.supplier_id, 'selected_days', days),
        },
        {
            type: 'number',
            label: 'sort_order',
            value: supplier.sort_order,
            onChange: (e) => handleInputChange(supplier.supplier_id, 'sort_order', e.target.value),
            tdClassName: 'flex',
        },
    ];

    const mapItemToColumns = (item) => [
        {
            type: 'text',
            label: 'item_name',
            value: item.item_name || "ไม่ระบุ",
            readOnly: true,
        },
        {
            type: 'text',
            label: 'supplier_item_name',
            value: item.supplier_item_name || item.item_name.replace(/^\d+/, ''),
            onChange: (e) => handleItemInputChange(item.item_id, 'supplier_item_name', e.target.value),
        },
    ];

    return (
        <div>
            <DraggableTable
                headers={['ผู้จำหน่าย', 'รอบการสั่ง', 'เรียงลำดับ']}
                items={suppliers}
                mapItemToColumns={mapSupplierToColumns}
                onMoveItem={moveSupplier}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                expandedContent={() => null}
                onCellChange={handleInputChange}
            />
            {suppliers.map((supplier) => (
                <div key={supplier.supplier_id} className="mb-6">
                    <h2 className="text-lg font-bold mb-2">{supplier.supplier_name}</h2>
                    {expandedItems[supplier.supplier_id] && (
                        <DraggableTable
                            headers={['Item Name', 'Supplier Item Name']}
                            items={groupedItems[supplier.supplier_id] || []}
                            mapItemToColumns={mapItemToColumns}
                            onMoveItem={() => {}}
                            expandedItems={expandedItems}
                            toggleExpand={toggleExpand}
                            expandedContent={() => null}
                            onCellChange={handleItemInputChange}
                        />
                    )}
                    <button onClick={() => toggleExpand(supplier.supplier_id)}>
                        {expandedItems[supplier.supplier_id] ? 'Hide Items' : 'Show Items'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SupplierSettingsTable;