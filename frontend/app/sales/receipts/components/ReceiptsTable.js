// src/app/receipts/components/ReceiptsTable.js
import React, { useState, useEffect, useRef } from "react";
import { formatDateToThai } from '../../../utils/dateUtils';
import { formatNumber, formatCurrency } from '../../../utils/NumberFormat';
import { normalizeStoreName } from '../../../utils/StoreName';

const calculateSum = (items, key) => {
    const sum = items.reduce((acc, item) => acc + (item[key] || 0), 0);
    return sum;
};

const calculateValueSum = (items) => {
    return items.reduce((acc, item) => acc + (item.total_money || 0), 0);
};

const ReceiptsTable = ({ items, selectedStores, selectedEmployees }) => {
    const [isExpanded, setIsExpanded] = useState({});
    const tableRef = useRef(null);

    useEffect(() => {
        if (tableRef.current) {
            const tdCount = tableRef.current.querySelectorAll('td').length;
            console.log(`มี <td> ในตาราง: ${tdCount}`);
        }
    }, []);

    useEffect(() => {
        console.log("Items in ReceiptsTable:", items); // ตรวจสอบข้อมูลที่ถูกส่งไปยังคอมโพเนนต์
    }, [items]);

    const thClass = "p-2 font-semibold text-gray-700 text-left bg-gray-100 shadow-md border-r border-gray-300 resize-handle";
    const tdClass = "p-2 border-r border-b border-gray-300 text-gray-700";

    const toggleExpandRow = (index) => {
        setIsExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    // กรองข้อมูลตามร้านค้าและพนักงานที่เลือก
    const filteredItems = items.filter(item =>
        (selectedStores.length === 0 || selectedStores.includes(normalizeStoreName(item.store_name))) &&
        (selectedEmployees.length === 0 || selectedEmployees.includes(item.employee_name))
    );

    return (
        <div>
            <table ref={tableRef} className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr>
                        <th className={`${thClass} w-48`}>วันที่</th>
                        <th className={`${thClass} w-48`}>เลขที่ใบเสร็จ</th>
                        <th className={`${thClass} w-48`}>จำนวนเงิน</th>
                        <th className={`${thClass} w-48`}>รายการสินค้า</th>
                        <th className={`${thClass} w-48`}>ร้านค้า</th>
                        <th className={`${thClass} w-48`}>พนักงาน</th>
                        <th className={`${thClass} w-48`}>สถานะ</th>
                        <th className={`${thClass} w-48`}>ส่วนลดทั้งหมด</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((item, index) => (
                        <React.Fragment key={`${item.receipt_number}-${index}`}>
                            <tr onClick={() => toggleExpandRow(index)} className="cursor-pointer">
                                <td className={`${tdClass} w-48`}>{formatDateToThai(item.receipt_date)}</td>
                                <td className={`${tdClass} w-48`}>{item.receipt_number}</td>
                                <td className={`${tdClass} w-48 text-right`}>{formatCurrency(item.total_money)}</td>
                                <td className={`${tdClass} p-2 text-xs`}>
                                    <div
                                        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out`}
                                        style={{
                                            maxHeight: isExpanded[index] ? "300px" : "15px",
                                        }}
                                    >
                                        {item.line_items_summary ? (
                                            item.line_items_summary.split(', ').map((product, i) => (
                                                <div key={i} className="truncate">{product.trim()}</div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500">ไม่มีรายการสินค้า</div>
                                        )}
                                    </div>
                                    {item.line_items_summary && item.line_items_summary.split(', ').length > 1 && (
                                        <button tooltip="กดดูรายการสินค้าทั้งหมด"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExpandRow(index);
                                            }}
                                            className="text-gray-500 text-xs mt-1"
                                            style={{ textDecoration: 'none' }} // ลบเส้นใต้
                                        >
                                            {isExpanded[index] ? "ซ่อน" : `ทั้งหมด  (${item.line_items_summary.split(', ').length})`}
                                        </button>
                                    )}
                                </td>
                                <td className={`${tdClass} w-48`}>{normalizeStoreName(item.store_name)}</td>
                                <td className={`${tdClass} w-48`}>{item.employee_name}</td>
                                <td className={`${tdClass} w-48`}>{item.status}</td>
                                <td className={`${tdClass} w-48`}>{formatCurrency(item.total_discount)}</td>
                            </tr>

                        </React.Fragment>
                    ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-white">
                    <tr className="bg-gray-100">
                        <td className={`${tdClass} text-left py-2 font-bold`}>รวมทั้งหมด</td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}>{formatCurrency(calculateValueSum(filteredItems))}</td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ReceiptsTable;