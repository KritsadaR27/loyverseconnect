// POActionBar.js
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  CalendarIcon, 
  ArrowDownTrayIcon as Save, 
  PencilSquareIcon as Edit, 
  XMarkIcon as X,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SendLineDialog = ({
  open,
  onClose,
  onSend,
  lineGroups,
  setLineGroups,
  lineMessage,
  setLineMessage,
  lineNote,
  setLineNote,
  processingAction,
  suppliers,
  selectedSupplier,
  setSelectedSupplier
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>ส่งไลน์แจ้งเตือน</DialogTitle>
        <p className="text-sm text-gray-500 mt-1">เลือกกลุ่มไลน์และข้อความที่ต้องการส่ง</p>
      </DialogHeader>
      <div className="space-y-3 mt-4">
        <div>
          <label className="text-sm font-medium mb-1 block">ซัพพลายเออร์</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">-- ทุกซัพพลายเออร์ --</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {selectedSupplier 
              ? 'จะส่งเฉพาะรายการของซัพพลายเออร์ที่เลือก' 
              : 'จะส่งแยกเป็นข้อความสำหรับแต่ละซัพพลายเออร์'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ข้อความ</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={5}
            value={lineMessage}
            onChange={(e) => setLineMessage(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={2}
            value={lineNote}
            onChange={(e) => setLineNote(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ไอดีกลุ่ม (เช่น G123,G456)</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={lineGroups.join(',')}
            onChange={(e) =>
              setLineGroups(e.target.value.split(',').map((s) => s.trim()))
            }
          />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button 
          onClick={onSend}
          disabled={lineGroups.length === 0 || !lineMessage || processingAction}
          className="flex items-center gap-2"
        >
          {processingAction ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              กำลังส่ง...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="h-4 w-4" />
              ส่งข้อความ
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const CreatePODialog = ({
  open,
  onClose,
  onCreatePO,
  selectedSupplier,
  setSelectedSupplier,
  suppliers,
  processingAction
}) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>ออกใบสั่งซื้อ</DialogTitle>
        <p className="text-sm text-gray-500 mt-1">เลือกซัพพลายเออร์ที่ต้องการออกใบสั่งซื้อ</p>
      </DialogHeader>
      <div className="space-y-3 mt-4">
        <div>
          <label className="text-sm font-medium mb-1 block">ซัพพลายเออร์</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">-- ทุกซัพพลายเออร์ --</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {selectedSupplier 
              ? 'จะสร้างใบสั่งซื้อเฉพาะสำหรับซัพพลายเออร์ที่เลือก' 
              : 'จะสร้างใบสั่งซื้อแยกตามซัพพลายเออร์'}
          </p>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button 
          onClick={onCreatePO}
          disabled={processingAction}
          className="flex items-center gap-2"
        >
          {processingAction ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              กำลังสร้าง...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4" />
              สร้างใบสั่งซื้อ
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const POActionBar = ({
  deliveryDate,
  setDeliveryDate,
  targetCoverageDate,
  setTargetCoverageDate,
  futureDates,
  editingBuffers,
  setEditingBuffers,
  handleSaveBuffers,
  // LINE notification
  showSendLineDialog,
  handleOpenSendLineDialog,
  handleCloseSendLineDialog,
  handleSendLineNotification,
  lineGroups,
  setLineGroups,
  lineMessage,
  setLineMessage,
  lineNote,
  setLineNote,
  // Create PO
  showCreatePODialog,
  handleOpenCreatePODialog,
  handleCloseCreatePODialog,
  handleCreatePO,
  selectedSupplier,
  setSelectedSupplier,
  // Items for supplier selection
  suppliers = [],
  // Disabled state
  disabled = false,
  processingAction,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        {/* วันที่รับสินค้า */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">วันที่รับสินค้า</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] pl-3 text-left font-normal"
                disabled={disabled}
              >
                {deliveryDate ? (
                  format(new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate(), 0, 0, 0, 0), 'dd MMMM yyyy', { locale: th })
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
                disabled={disabled}
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

        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* ปุ่มแก้ไขยอดเผื่อ / บันทึกยอดเผื่อ */}
        <div>
          {editingBuffers ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingBuffers(false)}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleSaveBuffers();
                }}
                disabled={disabled || processingAction}
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
              disabled={disabled}
            >
              <Edit className="h-4 w-4 mr-1" />
              แก้ไขยอดเผื่อ
            </Button>
          )}
        </div>
      </div>
      
      {/* ส่วนปุ่มจาก Footer ที่ย้ายมา */}
      <div className="flex flex-wrap justify-end gap-2 border-t pt-3 mt-1">
        <Button
          variant="outline"
          onClick={handleOpenSendLineDialog}
          disabled={disabled || processingAction}
          className="flex items-center gap-2"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          ส่งไลน์แจ้งเตือน
        </Button>
        
        <Button
          variant="default"
          onClick={handleOpenCreatePODialog}
          disabled={disabled || processingAction}
          className="flex items-center gap-2"
        >
          <DocumentTextIcon className="h-4 w-4" />
          สร้างใบสั่งซื้อ
        </Button>
      </div>
      
      {/* LINE Notification Dialog */}
      <SendLineDialog
        open={showSendLineDialog}
        onClose={handleCloseSendLineDialog}
        onSend={handleSendLineNotification}
        lineGroups={lineGroups}
        setLineGroups={setLineGroups}
        lineMessage={lineMessage}
        setLineMessage={setLineMessage}
        lineNote={lineNote}
        setLineNote={setLineNote}
        processingAction={processingAction}
        suppliers={suppliers}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
      />
      
      {/* Create PO Dialog */}
      <CreatePODialog
        open={showCreatePODialog}
        onClose={handleCloseCreatePODialog}
        onCreatePO={handleCreatePO}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        suppliers={suppliers}
        processingAction={processingAction}
      />
    </div>
  );
};

export default POActionBar;