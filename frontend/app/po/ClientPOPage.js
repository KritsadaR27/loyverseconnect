'use client';

// app/po/ClientPOPage.js
import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import POActionBar from './components/POActionBar';
import POTable from './components/POTable';
import MobilePOView from './components/MobilePOView';
import Alert from '../../components/Alert'; // นำเข้า Alert component ที่มีอยู่
import usePO from './hooks/usePO';

// Add placeholder components if they're not available
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const ClientPOPage = () => {
  const { 
    items,
    groupedItems,
    filteredGroupedItems,
    deliveryDate,
    setDeliveryDate,
    targetCoverageDate,
    setTargetCoverageDate,
    futureDates,
    loading,
    storeStocks,
    editingBuffers,
    setEditingBuffers,
    processingAction,
    handleBufferChange,
    handleOrderQuantityChange,
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
    selectedSuppliers, // เปลี่ยนจาก selectedSupplier เป็น selectedSuppliers
    setSelectedSuppliers, // เปลี่ยนจาก setSelectedSupplier เป็น setSelectedSuppliers
    // Order quantity controls
    applyAllSuggestedQuantities,
    clearAllOrderQuantities,
    // Supplier filter
    supplierFilters, // เปลี่ยนจาก supplierFilter เป็น supplierFilters
    handleSupplierFilterChange,
    // UI state
    alert,
    setAlert,
    error
  } = usePO();
  
  const [isMobile, setIsMobile] = useState(false);
  
  // Responsive logic
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // ดึงรายชื่อซัพพลายเออร์ทั้งหมดจาก groupedItems
  const suppliers = Object.keys(groupedItems);
  
  return (
    <SidebarLayout
      headerTitle="ระบบสั่งซื้อสินค้า (PO Management)"
      actionBar={
        <POActionBar
          deliveryDate={deliveryDate}
          setDeliveryDate={setDeliveryDate}
          targetCoverageDate={targetCoverageDate}
          setTargetCoverageDate={setTargetCoverageDate}
          futureDates={futureDates}
          editingBuffers={editingBuffers}
          setEditingBuffers={setEditingBuffers}
          handleSaveBuffers={handleSaveBuffers}
          // LINE notification
          showSendLineDialog={showSendLineDialog}
          handleOpenSendLineDialog={handleOpenSendLineDialog}
          handleCloseSendLineDialog={handleCloseSendLineDialog}
          handleSendLineNotification={handleSendLineNotification}
          lineGroups={lineGroups}
          setLineGroups={setLineGroups}
          lineMessage={lineMessage}
          setLineMessage={setLineMessage}
          lineNote={lineNote}
          setLineNote={setLineNote}
          // Create PO
          showCreatePODialog={showCreatePODialog}
          handleOpenCreatePODialog={handleOpenCreatePODialog}
          handleCloseCreatePODialog={handleCloseCreatePODialog}
          handleCreatePO={handleCreatePO}
          selectedSuppliers={selectedSuppliers}
          setSelectedSuppliers={setSelectedSuppliers}
          // Items for supplier selection
          suppliers={suppliers}
          // Order quantity controls
          applyAllSuggestedQuantities={applyAllSuggestedQuantities}
          clearAllOrderQuantities={clearAllOrderQuantities}
          // Supplier filter
          supplierFilters={supplierFilters}
          handleSupplierFilterChange={handleSupplierFilterChange}
          // Disabled state
          disabled={loading || processingAction}
          processingAction={processingAction}
        />
      }
    >
      <div className="space-y-4 mt-2">
        {/* Show alert if it exists */}
        {alert && (
          <Alert 
            message={alert.message} 
            type={alert.type} 
            description={alert.description}
            onClose={() => setAlert(null)} 
          />
        )}
      
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            {Object.keys(filteredGroupedItems).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลสินค้า</h3>
                <p className="text-muted-foreground">
                  {error ? 
                    "เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง" : 
                    supplierFilter ? 
                    `ไม่พบรายการสินค้าจากซัพพลายเออร์ "${supplierFilter}"` :
                    "ไม่พบรายการสินค้าที่ต้องสั่งซื้อ"
                  }
                </p>
                {error && (
                  <div className="mt-4 text-xs text-red-500 max-w-md mx-auto text-left">
                    <p>รายละเอียดข้อผิดพลาด:</p>
                    <pre className="mt-1 p-2 bg-red-50 rounded overflow-auto text-left">
                      {error.message || JSON.stringify(error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isMobile ? (
                  <MobilePOView
                    items={items}
                    groupedItems={filteredGroupedItems}
                    storeStocks={storeStocks}
                    targetCoverageDate={targetCoverageDate}
                    setTargetCoverageDate={setTargetCoverageDate}
                    futureDates={futureDates}
                    handleBufferChange={handleBufferChange}
                    handleOrderQuantityChange={handleOrderQuantityChange}
                    editingBuffers={editingBuffers}
                    setEditingBuffers={setEditingBuffers}
                    handleSaveBuffers={handleSaveBuffers}
                    processingAction={processingAction}
                  />
                ) : (
                  <POTable
                    items={items}
                    groupedItems={filteredGroupedItems}
                    storeStocks={storeStocks}
                    futureDates={futureDates}
                    targetCoverageDate={targetCoverageDate}
                    setTargetCoverageDate={setTargetCoverageDate}
                    handleBufferChange={handleBufferChange}
                    handleOrderQuantityChange={handleOrderQuantityChange}
                    editingBuffers={editingBuffers}
                    setEditingBuffers={setEditingBuffers}
                    handleSaveBuffers={handleSaveBuffers}
                    processingAction={processingAction}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ClientPOPage;