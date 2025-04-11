import React, { useMemo } from 'react';
import { formatNumber, formatDate } from '@/lib/utils';

const POTable = ({
  items,
  groupedItems,
  storeStocks,
  futureDates,
  targetCoverageDate,
  setTargetCoverageDate,
  handleBufferChange,
  handleOrderQuantityChange,
  editingBuffers,
}) => {
  const dateColumns = useMemo(() => {
    return futureDates.map(date => {

      const getFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const dateStr = getFormattedDate(date);
      // Format date to 'YYYY-MM-DD'
      return {
        date,
        dateStr,
        label: formatDate(date, 'dd/MM'),
        isTarget: targetCoverageDate && getFormattedDate(date) === getFormattedDate(targetCoverageDate),
      };
    });
  }, [futureDates, targetCoverageDate]);

  const getStockLevelIndicator = (value) => {
    if (value < 0) return 'bg-red-100 text-red-800';
    if (value < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full border-collapse">
        {/* Table Headers */}
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2 text-left border sticky left-0 bg-slate-50 z-20">รหัส/รายการ</th>
            <th className="p-2 text-center border">สต็อกรวม</th>
            {dateColumns.map((col) => (
              <th
                key={col.date.toISOString()}
                className={`p-2 text-center border ${col.isTarget ? 'bg-blue-50' : ''}`}
              >
                <div className="text-xs font-normal text-gray-500">
                  {col.label}
                  {col.isTarget && <span className="ml-1 text-blue-600">*</span>}
                </div>
                <div className="text-xs font-normal mt-1">
                  (คลิกวันที่ต้องการ)
                </div>
              </th>
            ))}
            <th className="p-2 text-center border">ยอดเผื่อ</th>
            <th className="p-2 text-center border">แนะนำ</th>
            <th className="p-2 text-center border">สั่ง <span className="text-xs text-gray-500">(ชิ้น)</span></th>
          </tr>
        </thead>

        {/* Table Body with Supplier Groups */}
        <tbody>
          {Object.entries(groupedItems).map(([supplier, supplierItems]) => (
            <React.Fragment key={supplier}>
              {/* Supplier Header Row */}
              <tr className="bg-blue-100">
                <td colSpan={7 + dateColumns.length} className="p-2 font-bold">
                  {supplier}
                </td>
              </tr>

              {/* Item Rows */}
              {supplierItems.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 border sticky left-0 bg-white z-10">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.code}</span>
                    </div>
                  </td>
                  <td className="p-2 text-center border">
                    <div
                      className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStockLevelIndicator(item.currentStock)}`}
                      title={Object.entries(storeStocks[item.id] || {})
                        .map(([storeName, qty]) => `${storeName}: ${formatNumber(qty)}`)
                        .join('\n')}
                    >
                      {formatNumber(item.currentStock)}
                    </div>
                  </td>
                  {dateColumns.map((col, colIndex) => {
                      const dateStr = col.dateStr;
                      
                      // ตรวจสอบว่ามีข้อมูลยอดขายของวันนี้หรือไม่ 
                      // เปลี่ยนจากการใช้ Object.keys().includes เป็นดูที่ค่าโดยตรง
                      const dailySale = item.dailySales && typeof item.dailySales[dateStr] !== 'undefined' 
                        ? item.dailySales[dateStr] 
                        : 0;
                      
                      // Accumulate sales up to this date
                      let accumulatedSales = 0;
                      for (let i = 0; i <= colIndex; i++) {
                        const dateKey = dateColumns[i].dateStr;
                        const daySale = item.dailySales && typeof item.dailySales[dateKey] !== 'undefined'
                          ? item.dailySales[dateKey]
                          : 0;
                        accumulatedSales += daySale;
                      }
                      
                      // Calculate remaining stock
                      const remainingStock = Math.round(item.currentStock - accumulatedSales);
                      
                      return (
                        <td
                          key={`${item.id}-${col.date.toISOString()}`}
                          className={`p-2 text-center border ${col.isTarget ? 'bg-blue-50' : ''}`}
                          onClick={() => setTargetCoverageDate(col.date)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="text-xs text-red-600">
                              {dailySale > 0 ? `- ${formatNumber(dailySale)}` : '0'}
                            </div>
                            <div className={`font-medium ${remainingStock < 0 ? 'text-red-600' : ''}`}>
                              {formatNumber(remainingStock)}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                  <td className="p-2 text-center border">
                    <input
                      type="number"
                      min="0"
                      value={item.buffer || 0}
                      onChange={(e) =>
                        handleBufferChange(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-20 mx-auto text-center border rounded px-1 py-1 text-sm"
                      disabled={!editingBuffers}
                    />
                  </td>
                  <td className="p-2 text-center border font-medium">
                    {formatNumber(item.suggestedOrderQuantity)}
                  </td>
                  <td className="p-2 text-center border">
                    <input
                      type="number"
                      min="0"
                      value={item.orderQuantity || 0}
                      onChange={(e) =>
                        handleOrderQuantityChange(item.id, parseInt(e.target.value) || 0)
                      }
                      className={`w-20 mx-auto text-center border rounded px-1 py-1 text-sm ${
                        (item.orderQuantity || 0) !== item.suggestedOrderQuantity
                          ? 'bg-yellow-50 border-yellow-300'
                          : ''
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default POTable;