// app/po/hooks/usePO.js
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

const usePO = (initialData = {}) => {
  const [items, setItems] = useState(initialData.items || []);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [targetCoverageDate, setTargetCoverageDate] = useState(null);
  const [futureDates, setFutureDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStocks, setStoreStocks] = useState({});
  const [editingBuffers, setEditingBuffers] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);
  
  // Create dates for future projections
  useEffect(() => {
    const currentDate = new Date(deliveryDate);
    const futureProjectionDates = [];
    
    // Create future dates for projection
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      futureProjectionDates.push(date);
    }
    
    setFutureDates(futureProjectionDates);
    
    // Set default target date (delivery date + 1)
    if (!targetCoverageDate || targetCoverageDate < currentDate) {
      const defaultTarget = new Date(currentDate);
      defaultTarget.setDate(defaultTarget.getDate() + 1);
      setTargetCoverageDate(defaultTarget);
    }
  }, [deliveryDate, targetCoverageDate]);
  
  // Load stock and sales data
  useEffect(() => {
    const loadData = async () => {
      if (futureDates.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading data with future dates:', futureDates);
        
        // Fetch inventory data
        let inventoryData;
        try {
          inventoryData = await fetchInventoryData();
          console.log('Inventory data loaded:', inventoryData);
        } catch (inventoryError) {
          console.error('Failed to fetch inventory data:', inventoryError);
          setAlert({
            message: "ไม่สามารถโหลดข้อมูลสต็อกได้",
            type: "error",
            description: "กำลังใช้ข้อมูลตัวอย่างแทน",
          });
          throw inventoryError;
        }
        
        // Fetch sales data
        let salesData;
        try {
          salesData = await fetchSalesData(futureDates);
          console.log('Sales data loaded:', salesData);
        } catch (salesError) {
          console.error('Failed to fetch sales data:', salesError);
          setAlert({
            message: "ไม่สามารถโหลดข้อมูลยอดขายได้",
            type: "error",
            description: "กำลังใช้ข้อมูลตัวอย่างแทน",
          });
          throw salesError;
        }
        
        // Process data into usable format
        const processedItems = processItemsWithSalesData(inventoryData, salesData);
        setItems(processedItems);
        
        // Fetch store stock data
        const itemIds = processedItems.map(item => item.id);
        try {
          const storeStocksData = await fetchStoreStocks(itemIds);
          setStoreStocks(storeStocksData);
          console.log('Store stocks loaded:', storeStocksData);
        } catch (storeStocksError) {
          console.error('Failed to fetch store stocks:', storeStocksError);
          setAlert({
            message: "ไม่สามารถโหลดข้อมูลสต็อกตามสาขาได้",
            type: "error",
            description: "กำลังใช้ข้อมูลตัวอย่างแทน",
          });
          // Don't throw here - we can continue with mock store stocks
        }
        
        // Calculate suggested order quantities based on target date
        if (targetCoverageDate) {
          updateSuggestedOrderQuantities(processedItems, targetCoverageDate);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error);
        // We don't set alert here as individual alerts are set for specific failures
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [futureDates]);
  
  // Update suggested order quantities when target date changes
  useEffect(() => {
    if (targetCoverageDate && items.length > 0) {
      updateSuggestedOrderQuantities(items, targetCoverageDate);
    }
  }, [targetCoverageDate]);
  
  // Function to update suggested order quantities based on date
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
  
  // Function to update buffer quantities
  const handleBufferChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            buffer: value
          };
          
          // Recalculate suggested order quantity
          if (targetCoverageDate) {
            updatedItem.orderQuantity = calculateSuggestedOrderQuantity(updatedItem, targetCoverageDate);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  }, [targetCoverageDate]);
  
  // Function to update order quantities
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
  
  // Function to handle coverage date change
  const handleCoverageDateChange = useCallback((date) => {
    setTargetCoverageDate(date);
  }, []);
  
  // Function to save buffer quantities
  const handleSaveBuffers = useCallback(async () => {
    setProcessingAction(true);
    try {
      await saveBufferQuantities(items);
      
      setAlert({
        message: "บันทึกสำเร็จ",
        description: "บันทึกยอดเผื่อเรียบร้อยแล้ว",
        type: "success",
      });
      
      // Update editing status
      setEditingBuffers(false);
    } catch (error) {
      console.error("Error saving buffer quantities:", error);
      setAlert({
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกยอดเผื่อได้ กรุณาลองใหม่อีกครั้ง",
        type: "error",
      });
    } finally {
      setProcessingAction(false);
    }
  }, [items]);
  
  // Function to send Line notification
  const handleSendLineNotification = useCallback(async (lineData) => {
    setProcessingAction(true);
    try {
      const orderMessage = lineData.message || generateLineMessage(items, deliveryDate);
      
      await sendLineNotification({
        message: orderMessage,
        note: lineData.note || '',
        groupIds: lineData.groupIds || []
      });
      
      setAlert({ 
        message: "ส่งข้อความสำเร็จ",
        description: "ส่งแจ้งเตือนทางไลน์เรียบร้อยแล้ว",
        type: "success",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending Line notification:", error);
      setAlert({ 
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งแจ้งเตือนทางไลน์ได้ กรุณาลองใหม่อีกครั้ง",
        type: "error",
      });
      return false;
    } finally {
      setProcessingAction(false);
    }
  }, [items, deliveryDate]);
  
  // Function to generate purchase order
  const handleGeneratePO = useCallback(async (poData) => {
    setProcessingAction(true);
    try {
      // Filter items that have order quantities and match supplier
      const filteredItems = items.filter(
        item => item.orderQuantity > 0 && (!poData.supplierId || item.supplier_id === poData.supplierId)
      );
      
      if (filteredItems.length === 0) {
        setAlert({
          message: "ไม่มีรายการสั่งซื้อ",
          description: "ไม่พบรายการสั่งซื้อสำหรับซัพพลายเออร์นี้",
          type: "error",
        });
        return false;
      }
      
      const poItems = filteredItems.map(item => ({
        item_id: item.id,
        quantity: item.orderQuantity,
        unit_price: item.unit_price || 0
      }));
      
      const purchaseOrderData = {
        supplier_id: poData.supplierId || filteredItems[0].supplier_id,
        delivery_date: deliveryDate.toISOString(),
        items: poItems,
        total_amount: calculateTotalOrderValue(filteredItems)
      };
      
      const result = await generatePurchaseOrder(purchaseOrderData);
      
      setAlert({ 
        message: "สร้างใบรับของสำเร็จ",
        description: `สร้างใบรับของเลขที่ ${result.po_number || 'PO-TEST'} เรียบร้อยแล้ว`,
        type: "success"
      });
      
      return true;
    } catch (error) {
      console.error("Error generating purchase order:", error);
      setAlert({ 
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างใบรับของได้ กรุณาลองใหม่อีกครั้ง",
        type: "error",
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
    handleGeneratePO,
    alert,
    setAlert,
    error
  };
};

export default usePO;