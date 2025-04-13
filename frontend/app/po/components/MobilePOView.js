// MobilePOView.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatNumber } from '@/lib/utils';
import { formatThaiDate, getThaiDay } from '@/app/utils/dateUtils';
import { 
  PencilSquareIcon as Edit, 
  ArrowDownTrayIcon as Save,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const MobilePOView = ({
  items,
  groupedItems,
  storeStocks,
  targetCoverageDate,
  setTargetCoverageDate,
  futureDates,
  handleBufferChange,
  handleOrderQuantityChange,
  editingBuffers,
  setEditingBuffers,
  handleSaveBuffers,
  processingAction
}) => {
  // ตรวจสอบ props ที่ได้รับ
  console.log('[MobilePOView] Props received:', {
    editingBuffers,
    setEditingBuffers: typeof setEditingBuffers === 'function',
    handleSaveBuffers: typeof handleSaveBuffers === 'function',
    processingAction
  });
  
  // คำนวณระดับของสต็อก (สีแดง/เหลือง/เขียว)
  const getStockLevelIndicator = (value) => {
    if (value < 0) return 'bg-red-100 text-red-800';
    if (value < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* แสดงปุ่มเลือกวันที่ต้องการพอขาย (แบบมือถือ) */}
      <div className="bg-white p-3 rounded-lg border shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">วันที่ต้องการให้พอขาย</h3>
          
          {/* ปุ่มแก้ไข/บันทึกยอดเผื่อ */}
          {editingBuffers ? (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                console.log('Saving buffer settings in mobile view...');
                if (typeof handleSaveBuffers === 'function') {
                  handleSaveBuffers();
                } else {
                  console.error('handleSaveBuffers is not a function in mobile view!');
                }
              }}
              disabled={processingAction}
              className="h-8 text-xs"
            >
              {processingAction ? (
                <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              บันทึกยอดเผื่อ
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                console.log('Toggling edit mode ON in mobile view');
                if (typeof setEditingBuffers === 'function') {
                  setEditingBuffers(true);
                } else {
                  console.error('setEditingBuffers is not a function in mobile view!');
                }
              }}
              className="h-8 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              แก้ไขยอดเผื่อ
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {futureDates.map((date) => {
            const isSelected = targetCoverageDate && 
              date.toISOString().split('T')[0] === targetCoverageDate.toISOString().split('T')[0];
            
            return (
              <Button
                key={date.toISOString()}
                variant={isSelected ? "default" : "outline"}
                className="flex flex-col items-center justify-center p-2 h-auto"
                onClick={() => setTargetCoverageDate(date)}
              >
                <span className="text-xs">{getThaiDay(date)}</span>
                <span className="text-sm font-medium">{formatThaiDate(date, 'date-only')}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {Object.entries(groupedItems).map(([supplier, supplierItems]) => (
        <div key={supplier} className="space-y-2">
          <h3 className="text-lg font-bold py-2 px-3 bg-blue-100 rounded">{supplier}</h3>
          
          {supplierItems.map((item) => (
            <Card key={item.id} className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex justify-between items-center">
                  <div>
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500 block">{item.code}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-base px-3 py-1 ${getStockLevelIndicator(item.currentStock)}`}
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
                              <span>{storeName.replace("ลุงรวย สาขา", "")}:</span>
                              <span className="font-medium">{formatNumber(qty)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <h4 className="font-medium mt-3">ยอดขายและสต็อกคงเหลือ:</h4>
                        <div className="grid grid-cols-3 gap-1">
                          {futureDates.map((date, index) => {
                            const dateStr = date.toISOString().split('T')[0];
                            
                            // หาวันที่ย้อนหลัง 7 วัน (วันเดียวกันในสัปดาห์ที่แล้ว)
                            const previousWeekDate = new Date(date);
                            previousWeekDate.setDate(previousWeekDate.getDate() - 7);
                            const previousWeekDateStr = previousWeekDate.toISOString().split('T')[0];
                            
                            // ใช้ยอดขายจากสัปดาห์ก่อน หรือ 0 ถ้าไม่มีข้อมูล
                            const dailySale = item.dailySales && item.dailySales[previousWeekDateStr] 
                              ? item.dailySales[previousWeekDateStr] 
                              : 0;
                            
                            // คำนวณสต็อกคงเหลือ
                            let remainingStock = item.currentStock;
                            if (item.projectedStock && item.projectedStock[dateStr] !== undefined) {
                              remainingStock = item.projectedStock[dateStr];
                            } else {
                              // คำนวณแบบง่ายๆ ถ้าไม่มีข้อมูล projectedStock
                              remainingStock = item.currentStock - (dailySale * (index + 1));
                            }
                            
                            const isTargetDate = targetCoverageDate && 
                              dateStr === targetCoverageDate.toISOString().split('T')[0];
                              
                            return (
                              <div 
                                key={date.toISOString()} 
                                className={`flex flex-col p-2 rounded border ${
                                  isTargetDate ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                                }`}
                                onClick={() => setTargetCoverageDate(date)}
                              >
                                <span className="text-xs font-medium">{getThaiDay(date)}</span>
                                <span className="text-xs">{formatThaiDate(date, 'date-only')}</span>
                                <span className="text-xs text-red-600 mt-1 bg-red-50 px-1 py-0.5 rounded">
                                  {dailySale > 0 ? `- ${formatNumber(dailySale)}` : '0'}
                                </span>
                                <span className={`font-medium ${remainingStock < 0 ? 'text-red-600' : ''}`}>
                                  {formatNumber(remainingStock)}
                                </span>
                              </div>
                            );
                          })}
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
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleBufferChange(item.id, newValue);
                      }}
                      className="w-full text-center"
                      disabled={!editingBuffers}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <label className="text-xs mb-1">ยอดแนะนำ</label>
                    <div className="font-medium text-center h-10 flex items-center justify-center border rounded p-2 bg-gray-50 text-blue-600 text-lg">
                      {formatNumber(item.suggestedOrderQuantity)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <label className="text-xs mb-1">ยอดสั่ง</label>
                    <Input
                      type="number"
                      min="0"
                      value={item.orderQuantity || 0}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        handleOrderQuantityChange(item.id, newValue);
                      }}
                      className={`w-full text-center ${
                        (item.orderQuantity || 0) !== item.suggestedOrderQuantity ? 'bg-yellow-50 border-yellow-300' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MobilePOView;