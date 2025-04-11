// POFooter.js
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PaperAirplaneIcon as Send, DocumentTextIcon as FileText, ArrowPathIcon as Loader2 } from '@heroicons/react/24/outline';



const POFooter = ({
  onSendLine,
  onGeneratePO,
}) => {
  const [openLineDialog, setOpenLineDialog] = useState(false);
  const [openPODialog, setOpenPODialog] = useState(false);
  const [lineGroups, setLineGroups] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [lineMessage, setLineMessage] = useState('');
  const [lineNote, setLineNote] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);
  
  // สมมติข้อมูลกลุ่มไลน์และซัพพลายเออร์
  const lineGroupOptions = [
    { id: 'g1', name: 'กลุ่มผู้บริหาร' },
    { id: 'g2', name: 'กลุ่มสั่งซื้อสินค้า' },
    { id: 'g3', name: 'กลุ่มแอดมิน' },
  ];
  
  const supplierOptions = [
    { id: 's1', name: 'ซัพพลายเออร์ A' },
    { id: 's2', name: 'ซัพพลายเออร์ B' },
    { id: 's3', name: 'ซัพพลายเออร์ C' },
  ];

  const handleSendLine = async () => {
    setLoadingSend(true);
    try {
      await onSendLine({
        message: lineMessage,
        note: lineNote,
        groupIds: lineGroups
      });
      setOpenLineDialog(false);
      setLineGroups([]);
      setLineMessage('');
      setLineNote('');
    } catch (error) {
      console.error("Error sending Line notification:", error);
    } finally {
      setLoadingSend(false);
    }
  };
  
  const handleGeneratePO = async () => {
    setLoadingPO(true);
    try {
      await onGeneratePO({
        supplierId: selectedSupplier,
      });
      setOpenPODialog(false);
      setSelectedSupplier('');
    } catch (error) {
      console.error("Error generating PO:", error);
    } finally {
      setLoadingPO(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
      {/* ปุ่มส่งไลน์ */}
      <Dialog open={openLineDialog} onOpenChange={setOpenLineDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            ส่งไลน์แจ้งเตือน
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ส่งไลน์แจ้งเตือน</DialogTitle>
            <DialogDescription>
              เลือกกลุ่มไลน์และข้อความที่ต้องการส่ง
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">เลือกกลุ่มไลน์</h4>
              <div className="grid gap-2">
                {lineGroupOptions.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`line-group-${group.id}`} 
                      checked={lineGroups.includes(group.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setLineGroups([...lineGroups, group.id]);
                        } else {
                          setLineGroups(lineGroups.filter(id => id !== group.id));
                        }
                      }}
                    />
                    <label 
                      htmlFor={`line-group-${group.id}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">ข้อความ</h4>
              <Textarea 
                placeholder="รายละเอียดการสั่งซื้อ"
                value={lineMessage}
                onChange={(e) => setLineMessage(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">หมายเหตุ</h4>
              <Input 
                placeholder="เพิ่มเติม (ถ้ามี)"
                value={lineNote}
                onChange={(e) => setLineNote(e.target.value)} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleSendLine} 
              disabled={lineGroups.length === 0 || !lineMessage || loadingSend}
            >
              {loadingSend ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  ส่งข้อความ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ปุ่มออกใบรับของ */}
      <Dialog open={openPODialog} onOpenChange={setOpenPODialog}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            ออกใบรับของ
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ออกใบรับของ</DialogTitle>
            <DialogDescription>
              เลือกซัพพลายเออร์ที่ต้องการออกใบรับของ
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">เลือกซัพพลายเออร์</h4>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกซัพพลายเออร์" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOptions.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleGeneratePO} 
              disabled={!selectedSupplier || loadingPO}
            >
              {loadingPO ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังออกใบรับของ...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  ยืนยัน
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POFooter;