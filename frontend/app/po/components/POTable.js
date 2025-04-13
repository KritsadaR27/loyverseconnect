// frontend/app/po/components/POTable.js

import React, { useMemo } from 'react';
import { formatNumber } from '@/lib/utils';
import { formatThaiDate, getThaiDay } from '@/app/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { 
  PencilSquareIcon as Edit, 
  ArrowDownTrayIcon as Save,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { OrderQuantityInput } from './OrderQuantityInput';
import { BufferQuantityInput } from './BufferQuantityInput';


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
  setEditingBuffers,
  handleSaveBuffers,
  processingAction
}) => {
  // ตรวจสอบ props ที่ได้รับ
  console.log('[POTable] Props received:', {
    editingBuffers,
    setEditingBuffers: typeof setEditingBuffers === 'function',
    handleSaveBuffers: typeof handleSaveBuffers === 'function',
    processingAction
  });

  const dateColumns = useMemo(() => {
    return futureDates.map(date => {
      const getFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const dateStr = getFormattedDate(date);
      // แสดงชื่อวันเป็นภาษาไทย และวันที่แบบ วัน/เดือน
      return {
        date,
        dateStr,
        label: formatThaiDate(date, 'day-month'),
        dayName: getThaiDay(date),
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
                <button 
                  className="w-full flex flex-col items-center justify-center focus:outline-none hover:bg-blue-100 p-1 rounded"
                  onClick={() => setTargetCoverageDate(col.date)}
                >
                  <div className="text-xs font-normal text-gray-500">
                    {col.dayName}
                  </div>
                  <div className="text-xs font-medium">
                    {col.label.split(' ')[1]}
                    {col.isTarget && <span className="ml-1 text-blue-600">*</span>}
                  </div>
                </button>
              </th>
            ))}
            <th className="p-2 text-center border">
              <div className="flex flex-col items-center">
                <span>ยอดเผื่อ</span>
                {editingBuffers ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      console.log('Saving buffer settings...');
                      if (typeof handleSaveBuffers === 'function') {
                        handleSaveBuffers();
                      } else {
                        console.error('handleSaveBuffers is not a function!');
                      }
                    }}
                    disabled={processingAction}
                    className="mt-1 h-7 text-xs"
                  >
                    {processingAction ? (
                      <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Save className="h-3 w-3 mr-1" />
                    )}
                    บันทึก
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      console.log('Toggling edit mode ON');
                      if (typeof setEditingBuffers === 'function') {
                        setEditingBuffers(true);
                      } else {
                        console.error('setEditingBuffers is not a function!');
                      }
                    }}
                    className="mt-1 h-7 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    แก้ไข
                  </Button>
                )}
              </div>
            </th>
            <th className="p-2 text-center border">แนะนำ</th>
            <th className="p-2 text-center border">สั่ง</th>
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
                      className={`inline-block px-3 py-2 rounded text-base font-medium ${getStockLevelIndicator(item.currentStock)}`}
                      title={Object.entries(storeStocks[item.id] || {})
                        .map(([storeName, qty]) => `${storeName}: ${formatNumber(qty)}`)
                        .join('\n')}
                    >
                      {formatNumber(item.currentStock)}
                    </div>
                  </td>
                  {dateColumns.map((col, colIndex) => {
                    const dateStr = col.dateStr;
                    const currentDate = col.date;
                    
                    // หาวันที่ย้อนหลัง 7 วัน (วันเดียวกันในสัปดาห์ที่แล้ว)
                    const previousWeekDate = new Date(currentDate);
                    previousWeekDate.setDate(previousWeekDate.getDate() - 6);
                    const previousWeekDateStr = previousWeekDate.toISOString().split('T')[0];
                    
                    // ใช้ยอดขายของสัปดาห์ที่แล้วในวันที่ตรงกัน หรือ 0 ถ้าไม่มีข้อมูล
                    const dailySale = item.dailySales && item.dailySales[previousWeekDateStr] !== undefined
                      ? item.dailySales[previousWeekDateStr]
                      : 0;
                    
                    // คำนวณสต็อกคงเหลือ
                    let remainingStock;
                    
                    // ถ้ามีข้อมูล projectedStock จาก hook ให้ใช้ค่านั้น
                    if (item.projectedStock && item.projectedStock[dateStr] !== undefined) {
                      remainingStock = item.projectedStock[dateStr];
                    } else {
                      // คำนวณเอง โดยหักจากยอดขายวันที่ผ่านมา (ของสัปดาห์ที่แล้ว)
                      remainingStock = item.currentStock;
                      for (let i = 0; i <= colIndex; i++) {
                        const currentDay = dateColumns[i].date;
                        const prevWeekDay = new Date(currentDay);
                        prevWeekDay.setDate(prevWeekDay.getDate() - 6);
                        const prevWeekDayStr = prevWeekDay.toISOString().split('T')[0];
                        
                        const daySale = item.dailySales && item.dailySales[prevWeekDayStr]
                          ? item.dailySales[prevWeekDayStr]
                          : 0;
                        
                        remainingStock -= daySale;
                      }
                    }
                    
                    return (
                      <td
                        key={`${item.id}-${col.date.toISOString()}`}
                        className={`p-2 text-center border ${col.isTarget ? 'bg-blue-50' : ''}`}
                        onClick={() => setTargetCoverageDate(col.date)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-red-600 bg-red-50 px-1 py-0.5 rounded" title={`ยอดขาย ${previousWeekDate.toLocaleDateString('th-TH')}`}>
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
                    <BufferQuantityInput
                      itemId={item.id}
                      initialValue={item.buffer}
                      onChange={handleBufferChange}
                      disabled={!editingBuffers}
                    />
                  </td>
                  <td className="p-2 text-center border font-medium">
                    <span className="text-blue-600 text-lg">
                      {formatNumber(item.suggestedOrderQuantity)}
                    </span>
                  </td>
                  <td className="p-2 text-center border">
                    <OrderQuantityInput
                      itemId={item.id}
                      initialValue={item.orderQuantity}
                      suggestedValue={item.suggestedOrderQuantity}
                      onChange={handleOrderQuantityChange}
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
