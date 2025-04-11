// hooks/usePO.js
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchInventoryData, 
  fetchSalesData, 
  fetchStoreStocks, 
  saveBufferQuantities,
  sendLineNotification,
  generatePurchaseOrder
} from '@/app/api/poService';
import { 
  processItemsWithSalesData, 
  calculateSuggestedOrderQuantity,
  generateLineMessage, 
  groupItemsBySupplier,
  calculateTotalOrderValue 
} from '@/app/po/utils/calculations';
import { toast } from '@/components/ui/use-toast';

const usePO = (initialData = {}) => {
  const [items, setItems] = useState(initialData.items || []);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [targetCoverageDate, setTargetCoverageDate] = useState(null);
  const [futureDates, setFutureDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStocks, setStoreStocks] = useState({});
  const [editingBuffers, setEditingBuffers] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  // สร้างวันที่สำหรับการคาดการณ์ล่วงหน้า
  useEffect(() => {
    const currentDate = new Date(deliveryDate);
    const futureProjectionDates = [];
    
    // สร้างวันที่ล่วงหน้าเพื่อคาดการณ์
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      futureProjectionDates.push(date);
    }
    
    setFutureDates(futureProjectionDates);
    
    // ตั้งค่าวันที่เป้าหมายเริ่มต้น (วันที่ลงของ + 1)
    if (!targetCoverageDate || targetCoverageDate < currentDate) {
      const defaultTarget = new Date(currentDate);
      defaultTarget.setDate(defaultTarget.getDate() + 1);
      setTargetCoverageDate(defaultTarget);
    }
  }, [deliveryDate]);
  
  // โหลดข้อมูลสต็อกและยอดขาย
  useEffect(() => {
    const loadData = async () => {
      if (futureDates.length === 0) return;
      
      setLoading(true);
      try {
        // ดึงข้อมูลสต็อกและยอดขายพร้อมกัน
        const [inventoryData, salesData] = await Promise.all([
          fetchInventoryData(),
          fetchSalesData(futureDates)
        ]);
        
        // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้งานได้
        const processedItems = processItemsWithSalesData(inventoryData, salesData);
        setItems(processedItems);
        
        // ดึงข้อมูลสต็อกตามสาขา
        const itemIds = processedItems.map(item => item.id);
        const storeStocksData = await fetchStoreStocks(itemIds);
        setStoreStocks(storeStocksData);
        
        // คำนวณยอดสั่งซื้อแนะนำเริ่มต้น
        if (targetCoverageDate) {
          updateSuggestedOrderQuantities(processedItems, targetCoverageDate);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [futureDates]);
  
  // อัพเดทยอดสั่งซื้อแนะนำเมื่อเปลี่ยนวันที่
  useEffect(() => {
    if (targetCoverageDate && items.length > 0) {
      updateSuggestedOrderQuantities(items, targetCoverageDate);
    }
  }, [targetCoverageDate]);
  
  // ฟังก์ชันอัพเดทยอดสั่งซื้อแนะนำตามวันที่
  const updateSuggestedOrderQuantities = (itemsToUpdate, date) => {
    const updatedItems = itemsToUpdate.map(item => {
      const suggestedQuantity = calculateSuggestedOrderQuantity(item, date);
      return {
        ...item,
        orderQuantity: suggestedQuantity
      };
    });
    
    setItems(updatedItems);
  };
  
  // ฟังก์ชันอัพเดทยอดเผื่อ
  const handleBufferChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            buffer: value
          };
          
          // คำนวณยอดสั่งซื้อแนะนำใหม่
          if (targetCoverageDate) {
            updatedItem.orderQuantity = calculateSuggestedOrderQuantity(updatedItem, targetCoverageDate);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  }, [targetCoverageDate]);
  
  // ฟังก์ชันอัพเดทยอดสั่งซื้อ
  const handleOrderQuantityChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            orderQuantity: value
          };
        }
        return item;
      })
    );
  }, []);
  
  // ฟังก์ชันเมื่อเปลี่ยนวันที่ต้องการให้พอขาย
  const handleCoverageDateChange = useCallback((date) => {
    setTargetCoverageDate(date);
  }, []);
  
  // ฟังก์ชันบันทึกยอดเผื่อ
  const handleSaveBuffers = useCallback(async () => {
    setProcessingAction(true);
    try {
      await saveBufferQuantities(items);
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "บันทึกยอดเผื่อเรียบร้อยแล้ว",
        variant: "default",
      });
      
      // อัพเดทสถานะการแก้ไข
      setEditingBuffers(false);
    } catch (error) {
      console.error("Error saving buffer quantities:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกยอดเผื่อได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  }, [items]);
  
  // ฟังก์ชันส่งไลน์แจ้งเตือน
  const handleSendLineNotification = useCallback(async (lineData) => {
    setProcessingAction(true);
    try {
      const orderMessage = lineData.message || generateLineMessage(items, deliveryDate);
      
      await sendLineNotification({
        message: orderMessage,
        note: lineData.note || '',
        groupIds: lineData.groupIds || []
      });
      
      toast({
        title: "ส่งข้อความสำเร็จ",
        description: "ส่งแจ้งเตือนทางไลน์เรียบร้อยแล้ว",
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending Line notification:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งแจ้งเตือนทางไลน์ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingAction(false);
    }
  }, [items, deliveryDate]);
  
  // ฟังก์ชันออกใบรับของ
  const handleGeneratePO = useCallback(async (poData) => {
    setProcessingAction(true);
    try {
      // กรองเฉพาะสินค้าที่มีการสั่งซื้อและตรงกับซัพพลายเออร์
      const filteredItems = items.filter(
        item => item.orderQuantity > 0 && item.supplier_id === poData.supplierId
      );
      
      if (filteredItems.length === 0) {
        toast({
          title: "ไม่มีรายการสั่งซื้อ",
          description: "ไม่พบรายการสั่งซื้อสำหรับซัพพลายเออร์นี้",
          variant: "default",
        });
        return false;
      }
      
      const poItems = filteredItems.map(item => ({
        item_id: item.id,
        quantity: item.orderQuantity,
        unit_price: item.unit_price || 0
      }));
      
      const purchaseOrderData = {
        supplier_id: poData.supplierId,
        delivery_date: deliveryDate.toISOString(),
        items: poItems,
        total_amount: calculateTotalOrderValue(filteredItems)
      };
      
      const result = await generatePurchaseOrder(purchaseOrderData);
      
      toast({
        title: "สร้างใบรับของสำเร็จ",
        description: `สร้างใบรับของเลขที่ ${result.po_number} เรียบร้อยแล้ว`,
        variant: "default",
      });
      
      return true;
    } catch (error) {
      console.error("Error generating purchase order:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบรับของได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessingAction(false);
    }
  }, [items, deliveryDate]);
  
  return {
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
    handleGeneratePO
  };
};

export default usePO;