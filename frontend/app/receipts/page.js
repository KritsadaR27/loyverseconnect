"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { fetchReceipts } from '../utils/api';
import { formatDateToThai } from '../utils/dateUtils';
import Navigation from '../../components/Navigation';
const Page = () => {
    const [receipts, setReceipts] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });

    useEffect(() => {
        const loadReceipts = async () => {
            const fetchedReceipts = await fetchReceipts();
            setReceipts(fetchedReceipts);
        };

        loadReceipts();
    }, []);

    const handleSort = useCallback((key) => {
        setSortConfig((prevConfig) => {
            const direction = prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending';
            return { key, direction };
        });
    }, []);

    const sortedReceipts = [...receipts].sort((a, b) => {
        if (sortConfig.key === 'date') {
            return (new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || '';
        return (aVal > bVal ? 1 : -1) * (sortConfig.direction === 'ascending' ? 1 : -1);
    });

    return (
        <div>
            <Navigation />
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('receiptNumber')} className="cursor-pointer p-3">เลขที่ใบเสร็จรับเงิน</th>
                            <th onClick={() => handleSort('ReceiptDate')} className="cursor-pointer p-3">วันที่</th>
                            <th onClick={() => handleSort('StoreID')} className="cursor-pointer p-3">ร้านค้า</th>
                          

                            <th onClick={() => handleSort('total')} className="cursor-pointer p-3">รวมทั้งหมด</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedReceipts.map((receipt) => (
                            <tr key={receipt.receiptNumber} className="border-t">
                                <td className="p-3">{receipt.receiptNumber}</td>
                                <td className="p-3">{formatDateToThai(new Date(receipt.ReceiptDate), "วัน dd/mm/yyyy")}</td>
                                <td className="p-3">{receipt.StoreID}</td>
                            

                                <td className="p-3">{receipt.TotalMoney}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Page;
