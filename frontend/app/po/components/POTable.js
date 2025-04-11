// POTable.js
import React, { useMemo } from 'react';
import { 
  Table, TableHeader, TableBody, TableHead, 
  TableRow, TableCell 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  // สร้าง column headers จากวันที่
  const dateColumns = useMemo(() => {
    return futureDates.map(date => ({
      date,
      label: formatDate(date, 'dd/MM'),
      isTarget: date.toDateString() === targetCoverageDate?.toDateString()
    }));
  }, [futureDates, targetCoverageDate]);

  // คำนวณระดับของสต็อก (สีแดง/เหลือง/เขียว)
  const getStockLevelIndicator = (currentStock, targetStock) => {
    const ratio = currentStock / targetStock;
    if (ratio < 0.3) return 'bg-red-100 text-red-800';
    if (ratio < 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[200px]">สินค้า</TableHead>
            <TableHead className="w-[100px] text-center">สต็อกรวม</TableHead>
            {dateColumns.map((col) => (
              <TableHead 
                key={col.date.toISOString()} 
                className={`w-[120px] text-center ${col.isTarget ? 'bg-blue-50' : ''}`}
              >
                {col.label}
                {col.isTarget && <span className="ml-1 text-xs text-blue-600">*</span>}
              </TableHead>
            ))}
            <TableHead className="w-[100px] text-center">ยอดเผื่อ</TableHead>
            <TableHead className="w-[120px] text-center">ยอดแนะนำ</TableHead>
            <TableHead className="w-[120px] text-center">ยอดสั่งซื้อ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const suggestedQuantity = Math.max(0, 
              (item.dailySales[targetCoverageDate.toDateString()] || 0) - 
              item.currentStock + 
              (item.buffer || 0)
            );
            
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">{item.sku}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline"
                        className={getStockLevelIndicator(
                          item.currentStock, 
                          item.dailySales[targetCoverageDate.toDateString()] || 0
                        )}
                      >
                        {formatNumber(item.currentStock)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-xs">
                        {Object.entries(storeStocks[item.id] || {}).map(([storeName, qty]) => (
                          <div key={storeName} className="flex justify-between gap-2">
                            <span>{storeName}:</span>
                            <span className="font-medium">{formatNumber(qty)}</span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                {dateColumns.map((col) => (
                  <TableCell 
                    key={`${item.id}-${col.date.toISOString()}`} 
                    className={`text-center ${col.isTarget ? 'bg-blue-50' : ''}`}
                  >
                    {formatNumber(item.dailySales[col.date.toDateString()] || 0)}
                  </TableCell>
                ))}
                
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    value={item.buffer || 0}
                    onChange={(e) => handleBufferChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-20 mx-auto text-center"
                    disabled={!editingBuffers}
                  />
                </TableCell>
                
                <TableCell className="text-center font-medium">
                  {formatNumber(suggestedQuantity)}
                </TableCell>
                
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    value={item.orderQuantity || 0}
                    onChange={(e) => handleOrderQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className={`w-20 mx-auto text-center ${
                      (item.orderQuantity || 0) !== suggestedQuantity ? 'bg-yellow-50 border-yellow-300' : ''
                    }`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default POTable;