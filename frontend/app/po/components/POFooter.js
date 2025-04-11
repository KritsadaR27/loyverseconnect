// app/po/components/POFooter.js
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
import { PaperAirplaneIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/outline';

const POFooter = ({
  onSendLine,
  onGeneratePO,
  disabled = false
}) => {
  const [openLineDialog, setOpenLineDialog] = useState(false);
  const [openPODialog, setOpenPODialog] = useState(false);
  const [lineGroups, setLineGroups] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [lineMessage, setLineMessage] = useState('');
  const [lineNote, setLineNote] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingPO, setLoadingPO] = useState(false);

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
          <Button variant="outline" className="gap-2" disabled={disabled}>
            <PaperAirplaneIcon className="h-4 w-4" />
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
            {/* ส่วนอื่น ๆ */}
          </div>

          <DialogFooter>
            <Button
              onClick={handleSendLine}
              disabled={lineGroups.length === 0 || !lineMessage || loadingSend}
            >
              {loadingSend ? (
                <>
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
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
          <Button className="gap-2" disabled={disabled}>
            <DocumentTextIcon className="h-4 w-4" />
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
            {/* ส่วนอื่น ๆ */}
          </div>

          <DialogFooter>
            <Button
              onClick={handleGeneratePO}
              disabled={!selectedSupplier || loadingPO}
            >
              {loadingPO ? (
                <>
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                  กำลังออกใบรับของ...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="mr-2 h-4 w-4" />
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