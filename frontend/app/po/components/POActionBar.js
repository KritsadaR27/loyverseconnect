// POActionBar.js
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarIcon, ArrowDownTrayIcon as Save, PencilSquareIcon as Edit, XMarkIcon as X } from '@heroicons/react/24/outline';
const POActionBar = ({
  deliveryDate,
  setDeliveryDate,
  targetCoverageDate,
  setTargetCoverageDate,
  futureDates,
  editingBuffers,
  setEditingBuffers,
  handleSaveBuffers,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg border shadow-sm">
      {/* วันที่รับสินค้า */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">วันที่รับสินค้า</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] pl-3 text-left font-normal"
            >
              {deliveryDate ? (
                format(deliveryDate, 'dd MMMM yyyy', { locale: th })
              ) : (
                <span>เลือกวันที่</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deliveryDate}
              onSelect={setDeliveryDate}
              locale={th}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* วันที่ต้องการให้พอขาย */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">วันที่ต้องการให้พอขาย</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[180px] pl-3 text-left font-normal ${
                targetCoverageDate ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              {targetCoverageDate ? (
                format(targetCoverageDate, 'dd MMMM yyyy', { locale: th })
              ) : (
                <span>เลือกวันที่</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2">
              {futureDates.map((date) => (
                <Button
                  key={date.toISOString()}
                  variant={date.toDateString() === targetCoverageDate?.toDateString() ? "default" : "ghost"}
                  className="w-full justify-start my-1"
                  onClick={() => setTargetCoverageDate(date)}
                >
                  {format(date, 'dd MMMM yyyy', { locale: th })}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ปุ่มแก้ไขยอดเผื่อ / บันทึกยอดเผื่อ */}
      <div className="flex-1"></div> {/* Spacer */}
      
      <div>
        {editingBuffers ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingBuffers(false)}
            >
              <X className="h-4 w-4 mr-1" />
              ยกเลิก
            </Button>
            <Button
              size="sm"
              onClick={() => {
                handleSaveBuffers();
                setEditingBuffers(false);
              }}
            >
              <Save className="h-4 w-4 mr-1" />
              บันทึกยอดเผื่อ
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditingBuffers(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            แก้ไขยอดเผื่อ
          </Button>
        )}
      </div>
    </div>
  );
};

export default POActionBar;
