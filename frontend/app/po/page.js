"use client";

import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import Navigation from '../../components/Navigation';

const ItemType = {
    ROW: 'row',
};

const DraggableRow = ({ po, index, moveRow, selectedPOs, handleSelect }) => {
    const [, ref] = useDrag({
        type: ItemType.ROW,
        item: { index },
    });

    const [, drop] = useDrop({
        accept: ItemType.ROW,
        hover: (draggedItem) => {
            if (draggedItem.index !== index) {
                moveRow(draggedItem.index, index);
                draggedItem.index = index;
            }
        },
    });

    return (
        <tr ref={(node) => ref(drop(node))} className="border-b">
            <td className="py-2 px-4">
                <input
                    type="checkbox"
                    checked={selectedPOs.includes(po.id)}
                    onChange={() => handleSelect(po.id)}
                />
            </td>
            <td className="py-2 px-4">{po.id}</td>
            <td className="py-2 px-4">{po.item_name}</td>
            <td className="py-2 px-4">{po.total_stock}</td>
            <td className="py-2 px-4">{po.supplier_name || 'ไม่ทราบ'}</td>
            <td className="py-2 px-4">{new Date(po.order_date).toLocaleDateString()}</td>
            <td className="py-2 px-4">{po.status}</td>
            <td className="py-2 px-4">{po.updated_by || 'ไม่ทราบ'}</td>
        </tr>
    );
};

const POList = () => {
    const [poList, setPoList] = useState([]);
    const [selectedPOs, setSelectedPOs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPOs = async () => {
            try {
                const response = await axios.get('/api/purchase_orders');
                setPoList(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching PO list:", error);
                setLoading(false);
            }
        };
        fetchPOs();
    }, []);

    const handleSelect = (id) => {
        setSelectedPOs(prev =>
            prev.includes(id) ? prev.filter(poId => poId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedPOs(poList.length === selectedPOs.length ? [] : poList.map(po => po.id));
    };

    const handleBulkDelete = async () => {
        try {
            await axios.delete('/api/purchase_orders', { data: { ids: selectedPOs } });
            setPoList(poList.filter(po => !selectedPOs.includes(po.id)));
            setSelectedPOs([]);
            alert('Selected POs deleted successfully!');
        } catch (error) {
            console.error("Error deleting selected POs:", error);
        }
    };

    const handleBulkDownload = () => {
        const selectedData = poList.filter(po => selectedPOs.includes(po.id));
        const csvContent = "data:text/csv;charset=utf-8," 
            + selectedData.map(po => `${po.id},${po.item_name},${po.total_stock},${po.supplier_name},${po.order_date},${po.status},${po.updated_by}`)
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "purchase_orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const moveRow = (fromIndex, toIndex) => {
        const updatedList = [...poList];
        const [movedRow] = updatedList.splice(fromIndex, 1);
        updatedList.splice(toIndex, 0, movedRow);
        setPoList(updatedList);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <Navigation /> 
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">รายการใบสั่งซื้อ (PO)</h1>
                <div className="flex space-x-4 mb-4">
                    <button 
                        onClick={handleBulkDelete} 
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                        disabled={selectedPOs.length === 0}
                    >
                        ลบที่เลือก
                    </button>
                    <button 
                        onClick={handleBulkDownload} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        disabled={selectedPOs.length === 0}
                    >
                        ดาวน์โหลดที่เลือก
                    </button>
                </div>
                <table className="min-w-full bg-white shadow-md rounded">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4">
                                <input
                                    type="checkbox"
                                    checked={selectedPOs.length === poList.length && poList.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">ID</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">ชื่อสินค้า</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">จำนวนในสต๊อก</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">ผู้จัดหา</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">วันสั่งซื้อ</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">สถานะ</th>
                            <th className="py-2 text-left px-4 text-gray-600 font-medium">แก้ไขล่าสุดโดย</th>
                        </tr>
                    </thead>
                    <tbody>
                        {poList.map((po, index) => (
                            <DraggableRow
                                key={po.id}
                                index={index}
                                po={po}
                                moveRow={moveRow}
                                selectedPOs={selectedPOs}
                                handleSelect={handleSelect}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </DndProvider>
    );
};

export default POList;
