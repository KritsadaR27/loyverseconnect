// app/po/components/POGrid.js
"use client";

import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { usePOStore } from '../stores/poStore';
import { fetchPOs } from '../services/poService';

const POGrid = () => {
    const [poList, setPoList] = useState([]);
    const [selectedPOs, setSelectedPOs] = useState([]);
    const { bulkDelete, bulkDownload } = usePOStore();

    useEffect(() => {
        const loadPOs = async () => {
            const data = await fetchPOs();
            setPoList(data);
        };
        loadPOs();
    }, []);

    const columns = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50
        },
        { headerName: "ID", field: "id" },
        { headerName: "ชื่อสินค้า", field: "item_name" },
        { headerName: "จำนวนในสต๊อก", field: "total_stock" },
        { headerName: "ผู้จัดหา", field: "supplier_name" },
        { headerName: "วันสั่งซื้อ", field: "order_date", cellRenderer: (data) => new Date(data.value).toLocaleDateString() },
        { headerName: "สถานะ", field: "status" },
        { headerName: "แก้ไขล่าสุดโดย", field: "updated_by" },
    ];

    const onSelectionChanged = (event) => {
        const selectedRows = event.api.getSelectedRows();
        setSelectedPOs(selectedRows.map(row => row.id));
    };

    return (
        <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
            <AgGridReact
                rowData={poList}
                columnDefs={columns}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
            />
            <div className="mt-4">
                <button 
                    onClick={() => bulkDelete(selectedPOs)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    disabled={selectedPOs.length === 0}
                >
                    ลบที่เลือก
                </button>
                <button 
                    onClick={() => bulkDownload(selectedPOs, poList)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 ml-4"
                    disabled={selectedPOs.length === 0}
                >
                    ดาวน์โหลดที่เลือก
                </button>
            </div>
        </div>
    );
};

export default POGrid;
