// MobilePOView.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatNumber, formatDate } from '@/lib/utils';

const MobilePOView = ({
  items,
  storeStocks,
  targetCoverageDate,
  futureDates,
  handleBufferChange,
  handleOrderQuantityChange,
  editingBuffers,
}) => {
  // คำนวณระดับของสต็อก (สีแดง/เหลือง/เขียว)
  const getStockLevelIndicator = (currentStock, targetStock) => {
    const ratio = currentStock / targetStock;
    if (ratio < 0.3) return 'bg-red-100 text-red-800';
    if (ratio < 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const suggestedQuantity = Math.max(0, 
          (item.dailySales[targetCoverageDate.toDateString()] || 0) - 
          item.currentStock + 
          (item.buffer || 0)
        );
        
        return (
          <Card key={item.id} className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <div>
                  <span>{item.name}</span>
                  <span className="text-xs text-gray-500 block">{item.sku}</span>
                </div>
                <Badge 
                  variant="outline"
                  className={getStockLevelIndicator(
                    item.currentStock, 
                    item.dailySales[targetCoverageDate.toDateString()] || 0
                  )}
                >
                  สต็อกรวม: {formatNumber(item.currentStock)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="details">
                  <AccordionTrigger className="py-2 text-sm">
                    รายละเอียดสต็อกและยอดขาย
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <h4 className="font-medium">สต็อกตามสาขา:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(storeStocks[item.id] || {}).map(([storeName, qty]) => (
                          <div key={storeName} className="flex justify-between gap-1">
                            <span>{storeName}:</span>
                            <span className="font-medium">{formatNumber(qty)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <h4 className="font-medium mt-3">ยอดขายย้อนหลัง:</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {futureDates.map((date) => (
                          <div 
                            key={date.toISOString()} 
                            className={`flex flex-col p-1 rounded ${
                              date.toDateString() === targetCoverageDate?.toDateString() ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className="text-xs">{formatDate(date, 'dd/MM')}</span>
                            <span className="font-medium">{formatNumber(item.dailySales[date.toDateString()] || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center">
                  <label className="text-xs mb-1">ยอดเผื่อ</label>
                  <Input
                    type="number"
                    min="0"
                    value={item.buffer || 0}
                    onChange={(e) => handleBufferChange(item.id, parseInt(e.target.value) || 0)}
                    className="w-full text-center"
                    disabled={!editingBuffers}
                  />
                </div>
                
                <div className="flex flex-col items-center">
                  <label className="text-xs mb-1">ยอดแนะนำ</label>
                  <div className="font-medium text-center h-10 flex items-center justify-center border rounded p-2 bg-gray-50">
                    {formatNumber(suggestedQuantity)}
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <label className="text-xs mb-1">ยอดสั่งซื้อ</label>
                  <Input
                    type="number"
                    min="0"
                    value={item.orderQuantity || 0}
                    onChange={(e) => handleOrderQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className={`w-full text-center ${
                      (item.orderQuantity || 0) !== suggestedQuantity ? 'bg-yellow-50 border-yellow-300' : ''
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MobilePOView;