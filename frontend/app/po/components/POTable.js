import React, { useMemo } from 'react';
import { formatNumber, formatDate } from '@/lib/utils';

const POTable = ({
  items,
  storeStocks,
  futureDates,
  targetCoverageDate,
  handleBufferChange,
  handleOrderQuantityChange,
  editingBuffers,
}) => {
  const dateColumns = useMemo(() => {
    return futureDates.map(date => ({
      date,
      label: formatDate(date, 'dd/MM'),
      isTarget: date.toDateString() === targetCoverageDate?.toDateString()
    }));
  }, [futureDates, targetCoverageDate]);

  const getStockLevelIndicator = (currentStock, targetStock) => {
    const ratio = currentStock / targetStock;
    if (ratio < 0.3) return 'bg-red-100 text-red-800';
    if (ratio < 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-50">
          <tr>
            <th className="w-[200px] p-2 text-left border">สินค้า</th>
            <th className="w-[100px] p-2 text-center border">สต็อกรวม</th>
            {dateColumns.map((col) => (
              <th
                key={col.date.toISOString()}
                className={`w-[120px] p-2 text-center border ${col.isTarget ? 'bg-blue-50' : ''}`}
              >
                {col.label}
                {col.isTarget && <span className="ml-1 text-xs text-blue-600">*</span>}
              </th>
            ))}
            <th className="w-[100px] p-2 text-center border">ยอดเผื่อ</th>
            <th className="w-[120px] p-2 text-center border">ยอดแนะนำ</th>
            <th className="w-[120px] p-2 text-center border">ยอดสั่งซื้อ</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const suggestedQuantity = Math.max(
              0,
              (item.dailySales[targetCoverageDate.toDateString()] || 0) -
              item.currentStock +
              (item.buffer || 0)
            );

            return (
              <tr key={item.id} className="border-t">
                <td className="p-2 border">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.sku}</span>
                  </div>
                </td>
                <td className="p-2 text-center border">
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStockLevelIndicator(
                      item.currentStock,
                      item.dailySales[targetCoverageDate.toDateString()] || 0
                    )}`}
                    title={Object.entries(storeStocks[item.id] || {})
                      .map(([storeName, qty]) => `${storeName}: ${formatNumber(qty)}`)
                      .join('\n')}
                  >
                    {formatNumber(item.currentStock)}
                  </div>
                </td>
                {dateColumns.map((col) => (
                  <td
                    key={`${item.id}-${col.date.toISOString()}`}
                    className={`p-2 text-center border ${col.isTarget ? 'bg-blue-50' : ''}`}
                  >
                    {formatNumber(item.dailySales[col.date.toDateString()] || 0)}
                  </td>
                ))}
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    min="0"
                    value={item.buffer || 0}
                    onChange={(e) =>
                      handleBufferChange(item.id, parseInt(e.target.value) || 0)
                    }
                    className="w-20 mx-auto text-center border rounded px-1 py-0.5 text-sm"
                    disabled={!editingBuffers}
                  />
                </td>
                <td className="p-2 text-center border font-medium">
                  {formatNumber(suggestedQuantity)}
                </td>
                <td className="p-2 text-center border">
                  <input
                    type="number"
                    min="0"
                    value={item.orderQuantity || 0}
                    onChange={(e) =>
                      handleOrderQuantityChange(item.id, parseInt(e.target.value) || 0)
                    }
                    className={`w-20 mx-auto text-center border rounded px-1 py-0.5 text-sm ${
                      (item.orderQuantity || 0) !== suggestedQuantity
                        ? 'bg-yellow-50 border-yellow-300'
                        : ''
                    }`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default POTable;
