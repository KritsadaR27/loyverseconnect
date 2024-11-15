"use client";

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTable, useRowSelect } from 'react-table';
import Navigation from '../../components/Navigation';

const POList = () => {
    const [poList, setPoList] = useState([]);
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

    const columns = useMemo(
        () => [
            {
                id: 'selection',
                Header: ({ getToggleAllRowsSelectedProps }) => (
                    <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
                ),
                Cell: ({ row }) => (
                    <input type="checkbox" {...row.getToggleRowSelectedProps()} />
                ),
            },
            { Header: 'ID', accessor: 'id' },
            { Header: 'ชื่อสินค้า', accessor: 'item_name' },
            { Header: 'จำนวนในสต๊อก', accessor: 'total_stock' },
            { Header: 'ผู้จัดหา', accessor: 'supplier_name', Cell: ({ value }) => value || 'ไม่ทราบ' },
            {
                Header: 'วันสั่งซื้อ',
                accessor: 'order_date',
                Cell: ({ value }) => new Date(value).toLocaleDateString(),
            },
            { Header: 'สถานะ', accessor: 'status' },
            { Header: 'แก้ไขล่าสุดโดย', accessor: 'updated_by', Cell: ({ value }) => value || 'ไม่ทราบ' },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        selectedFlatRows,
    } = useTable(
        { columns, data: poList },
        useRowSelect,
    );

    const handleBulkDelete = async () => {
        const selectedIds = selectedFlatRows.map(row => row.original.id);
        try {
            await axios.delete('/api/purchase_orders', { data: { ids: selectedIds } });
            setPoList(poList.filter(po => !selectedIds.includes(po.id)));
            alert('Selected POs deleted successfully!');
        } catch (error) {
            console.error("Error deleting selected POs:", error);
        }
    };

    const handleBulkDownload = () => {
        const selectedData = selectedFlatRows.map(row => row.original);
        const csvContent = "data:text/csv;charset=utf-8," +
            selectedData.map(po => `${po.id},${po.item_name},${po.total_stock},${po.supplier_name},${po.order_date},${po.status},${po.updated_by}`)
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "purchase_orders.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navigation />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">รายการใบสั่งซื้อ (PO)</h1>
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                        disabled={selectedFlatRows.length === 0}
                    >
                        ลบที่เลือก
                    </button>
                    <button
                        onClick={handleBulkDownload}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        disabled={selectedFlatRows.length === 0}
                    >
                        ดาวน์โหลดที่เลือก
                    </button>
                </div>
                <table {...getTableProps()} className="min-w-full bg-white shadow-md rounded">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200">
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()} className="py-2 px-4 text-left text-gray-600 font-medium">
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className="border-b">
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()} className="py-2 px-4">
                                            {cell.render('Cell')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default POList;
