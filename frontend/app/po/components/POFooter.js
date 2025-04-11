import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const POFooter = ({ onSendLine, onGeneratePO, disabled = false }) => {
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
        groupIds: lineGroups,
      });
      setOpenLineDialog(false);
      setLineGroups([]);
      setLineMessage('');
      setLineNote('');
    } catch (error) {
      console.error('Error sending Line notification:', error);
    } finally {
      setLoadingSend(false);
    }
  };

  const handleGeneratePO = async () => {
    setLoadingPO(true);
    try {
      await onGeneratePO({ supplierId: selectedSupplier });
      setOpenPODialog(false);
      setSelectedSupplier('');
    } catch (error) {
      console.error('Error generating PO:', error);
    } finally {
      setLoadingPO(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
      {/* ปุ่มส่งไลน์ */}
      <button
        onClick={() => setOpenLineDialog(true)}
        className="border rounded px-4 py-2 flex items-center gap-2 text-sm"
        disabled={disabled}
      >
        <PaperAirplaneIcon className="h-4 w-4" />
        ส่งไลน์แจ้งเตือน
      </button>

      <dialog open={openLineDialog} className="w-full max-w-md p-4 rounded shadow-xl bg-white">
        <h2 className="text-lg font-semibold mb-1">ส่งไลน์แจ้งเตือน</h2>
        <p className="text-sm text-gray-500 mb-4">เลือกกลุ่มไลน์และข้อความที่ต้องการส่ง</p>

        <div className="space-y-3">
          <textarea
            className="w-full border rounded p-2 text-sm"
            placeholder="ข้อความ"
            value={lineMessage}
            onChange={(e) => setLineMessage(e.target.value)}
          />
          <textarea
            className="w-full border rounded p-2 text-sm"
            placeholder="หมายเหตุ (ไม่บังคับ)"
            value={lineNote}
            onChange={(e) => setLineNote(e.target.value)}
          />
          <input
            className="w-full border rounded p-2 text-sm"
            placeholder="ไอดีกลุ่ม (เช่น G123,G456)"
            value={lineGroups.join(',')}
            onChange={(e) =>
              setLineGroups(e.target.value.split(',').map((s) => s.trim()))
            }
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setOpenLineDialog(false)}
            className="text-sm px-3 py-1 border rounded"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSendLine}
            disabled={lineGroups.length === 0 || !lineMessage || loadingSend}
            className="text-sm px-3 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingSend ? (
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
          </button>
        </div>
      </dialog>

      {/* ปุ่มออกใบรับของ */}
      <button
        onClick={() => setOpenPODialog(true)}
        className="border rounded px-4 py-2 flex items-center gap-2 text-sm"
        disabled={disabled}
      >
        <DocumentTextIcon className="h-4 w-4" />
        ออกใบรับของ
      </button>

      <dialog open={openPODialog} className="w-full max-w-md p-4 rounded shadow-xl bg-white">
        <h2 className="text-lg font-semibold mb-1">ออกใบรับของ</h2>
        <p className="text-sm text-gray-500 mb-4">เลือกซัพพลายเออร์ที่ต้องการออกใบรับของ</p>

        <div className="space-y-3">
          <select
            className="w-full border rounded p-2 text-sm"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">-- เลือกซัพพลายเออร์ --</option>
            <option value="S001">ซัพพลายเออร์ A</option>
            <option value="S002">ซัพพลายเออร์ B</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setOpenPODialog(false)}
            className="text-sm px-3 py-1 border rounded"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleGeneratePO}
            disabled={!selectedSupplier || loadingPO}
            className="text-sm px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loadingPO ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                กำลังออกใบรับของ...
              </>
            ) : (
              <>
                <DocumentTextIcon className="h-4 w-4" />
                ยืนยัน
              </>
            )}
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default POFooter;
