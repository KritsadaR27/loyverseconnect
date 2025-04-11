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
  XMarkIcon as X,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { formatThaiDate } from '@/app/utils/dateUtils';

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
  // Order quantity controls
  applyAllSuggestedQuantities,
  clearAllOrderQuantities,
  // Supplier filter
  supplierFilter,
  handleSupplierFilterChange,
  // Disabled state
  disabled = false,
  processingAction,
}) => {
  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
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
                  formatThaiDate(deliveryDate, 'medium')
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
                  formatThaiDate(targetCoverageDate, 'medium')
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
                    {formatThaiDate(date, 'medium')}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ตัวกรองซัพพลายเออร์ */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">กรองตามซัพพลายเออร์</label>
          <select
            className="h-10 rounded-md border border-input px-3 py-2 text-sm"
            value={supplierFilter}
            onChange={(e) => handleSupplierFilterChange(e.target.value)}
            disabled={disabled}
          >
            <option value="">ทั้งหมด</option>
            {suppliers.map(supplier => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* ปุ่มจัดการยอดสั่ง */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={applyAllSuggestedQuantities}
            disabled={disabled || processingAction}
            className="h-10 flex items-center gap-1"
            title="ใส่ยอดแนะนำทั้งหมด"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            ใส่ยอดแนะนำ
          </Button>
          
          <Button
            variant="outline"
            onClick={clearAllOrderQuantities}
            disabled={disabled || processingAction}
            className="h-10 flex items-center gap-1"
            title="ล้างยอดสั่งทั้งหมด"
          >
            <TrashIcon className="h-4 w-4" />
            ล้างยอดสั่ง
          </Button>
        </div>
        
        {/* ปุ่มส่งไลน์แจ้งเตือน - สีเขียว */}
        <Button
          variant="default"
          onClick={handleOpenSendLineDialog}
          disabled={disabled || processingAction}
          className="h-10 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
          ส่งไลน์แจ้งเตือน
        </Button>
        
        {/* ปุ่มสร้างใบสั่งซื้อ - สีน้ำเงิน */}
        <Button
          variant="default"
          onClick={handleOpenCreatePODialog}
          disabled={disabled || processingAction}
          className="h-10 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <DocumentTextIcon className="h-4 w-4" />
          สร้างใบสั่งซื้อ
        </Button>
      </div>
      
      {/* ถ้ากำลังแก้ไขยอดเผื่อ แสดงข้อความคำแนะนำ */}
      {editingBuffers && (
        <div className="mt-1 p-2 bg-yellow-50 text-sm border border-yellow-200 rounded">
          <div className="flex items-center gap-2">
            <span>กำลังแก้ไขยอดเผื่อ - แก้ไขเสร็จแล้วกดปุ่มบันทึกที่หัวตาราง</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingBuffers(false)}
              className="ml-auto text-xs py-1"
            >
              <X className="h-4 w-4 mr-1" />
              ยกเลิก
            </Button>
          </div>
        </div>
      )}
      
      {/* ถ้ามีการเลือกซัพพลายเออร์ แสดงข้อความแจ้งเตือน */}
      {supplierFilter && (
        <div className="mt-1 p-2 bg-blue-50 text-sm border border-blue-200 rounded">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-blue-500" />
            <span>กำลังแสดงเฉพาะสินค้าจากซัพพลายเออร์: <strong>{supplierFilter}</strong></span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSupplierFilterChange("")}
              className="ml-auto text-xs py-1"
            >
              <X className="h-4 w-4 mr-1" />
              แสดงทั้งหมด
            </Button>
          </div>
        </div>
      )}
      
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