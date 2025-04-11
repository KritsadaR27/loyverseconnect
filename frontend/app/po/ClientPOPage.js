'use client';

// app/po/ClientPOPage.js
import { useState, useEffect } from 'react';
import SidebarLayout from '@/components/layouts/SidebarLayout';
import POActionBar from './components/POActionBar';
import POTable from './components/POTable';
import MobilePOView from './components/MobilePOView';
import POFooter from './components/POFooter';
import usePO from './hooks/usePO';
import Alert from '../../components/Alert'; // นำเข้า Alert component ที่มีอยู่


const ClientPOPage = () => {
  const { 
    items,
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
    handleCoverageDateChange,
    handleSaveBuffers,
    handleSendLineNotification,
    handleGeneratePO,
    alert,
    setAlert

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
          disabled={loading || processingAction}
        />
      }
    >
      <div className="space-y-4 mt-2">
        {loading ? (
          <div className="space-y-4">
           
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-2">📦</div>
                <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูลสินค้า</h3>
                <p className="text-muted-foreground">
                  ไม่พบรายการสินค้าที่ต้องสั่งซื้อ หรือระบบอาจมีปัญหาในการโหลดข้อมูล
                </p>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <MobilePOView
                    items={items}
                    storeStocks={storeStocks}
                    targetCoverageDate={targetCoverageDate}
                    futureDates={futureDates}
                    handleBufferChange={handleBufferChange}
                    handleOrderQuantityChange={handleOrderQuantityChange}
                    editingBuffers={editingBuffers}
                  />
                ) : (
                  <POTable
                    items={items}
                    storeStocks={storeStocks}
                    futureDates={futureDates}
                    targetCoverageDate={targetCoverageDate}
                    handleBufferChange={handleBufferChange}
                    handleOrderQuantityChange={handleOrderQuantityChange}
                    editingBuffers={editingBuffers}
                  />
                )}
                
                <POFooter
                  onSendLine={handleSendLineNotification}
                  onGeneratePO={handleGeneratePO}
                  disabled={processingAction || items.filter(item => item.orderQuantity > 0).length === 0}
                />
              </>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ClientPOPage;