// frontend/app/sales/salesbyitems/components/SalesByItemTable.js

import React from 'react';
import { formatDateToThai } from '../../../utils/dateUtils';
import { formatNumber, formatCurrency } from '../../../utils/NumberFormat';
import { normalizeStoreName } from '../../../utils/StoreName';
import { thClass, tdClass } from '../../../../styles/styles'; // นำเข้า styles จาก styles.js

const SalesByItemTable = ({ sales }) => {

    return (
        <div>
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100 shadow-lg sticky top-0 z-10">
                    <tr>
                        <th className={`${thClass} w-48`}>วันที่</th>
                        <th className={`${thClass} w-48`}>สินค้า</th>
                        <th className={`${thClass} w-48`}>จำนวน</th>
                        <th className={`${thClass} w-48`}>ราคา</th>
                        <th className={`${thClass} w-48`}>ต้นทุน</th>
                        <th className={`${thClass} w-48`}>ส่วนลด</th>
                        <th className={`${thClass} w-48`}>การจ่ายเงิน</th>
                        <th className={`${thClass} w-48`}>หมวดหมู่</th>
                        <th className={`${thClass} w-48`}>ร้านค้า</th>
                        <th className={`${thClass} w-48`}>เลขที่ใบเสร็จรับเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    {sales.map((sale, index) => {
                        const items = sale.item_name ? sale.item_name.split(",") : ["No Items"];

                        return (
                            <React.Fragment key={`${sale.receipt_number}-${index}`}>
                                <tr className="cursor-pointer">
                                    <td className={`${tdClass} w-48`}>{formatDateToThai(new Date(sale.receipt_date), "วัน dd เดือน พ.ศ. HH:MM")}</td>
                                    <td className={`${tdClass} w-48`}>
                                        <div className="overflow-hidden">
                                            {items.map((item, i) => (
                                                <div key={i} className="truncate">{item.trim()}</div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className={`${tdClass} w-48`}>{formatNumber(sale.quantity)}</td>
                                    <td className={`${tdClass} w-48`}>{formatCurrency(sale.total_sales)}</td>
                                    <td className={`${tdClass} w-48`}>{formatCurrency(sale.total_cost)}</td>
                                    <td className={`${tdClass} w-48`}>{formatCurrency(sale.total_discount)}</td>
                                    <td className={`${tdClass} w-48`}>{sale.payment_names}</td>
                                    <td className={`${tdClass} w-48`}>{sale.category_name}</td>
                                    <td className={`${tdClass} w-48`}>{normalizeStoreName(sale.store_name)}</td>
                                    <td className={`${tdClass} w-48`}>{sale.receipt_number}</td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                </tbody>
                <tfoot className="sticky bottom-0 bg-white">
                    <tr className="bg-gray-100">
                        <td className={`${tdClass} text-left py-2 font-bold`}>รวมทั้งหมด</td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
                        <td className={`${tdClass} w-48 text-left py-2 font-bold`}></td>
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

export default SalesByItemTable;