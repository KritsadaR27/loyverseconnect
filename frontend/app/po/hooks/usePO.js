// app/po/hooks/usePO.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchInventoryData,
  fetchSalesByDay,
  saveBufferSettings,
  sendLineNotification,
  createPO,
  fetchBufferSettings
} from '@/app/api/poService';

// รายชื่อซัพพลายเออร์ที่ต้องการเรียงลำดับ
const supplierOrder = [
  'หมูลุงรวย', 
  'จัมโบ้', 
  'ลูกชิ้น', 
  'อั่ว', 
  'เนื้อริบอาย', 
  'เนื้อโคขุน', 
  'แหนมเล็ก', 
  'แหนมใหญ่'
];

// ฟังก์ชันช่วยในการจัดการรูปแบบวันที่
const formatDateForAPI = (date) => {
  if (!date) return '';
  
  // ให้แน่ใจว่าเป็น Date object
  const dateObj = new Date(date);
  
  // สร้างรูปแบบ ISO ที่มีข้อมูล timezone (เช่น 2025-03-31T17:00:00.000Z)
  return dateObj.toISOString();
};

// ฟังก์ชันสำหรับแยกเฉพาะส่วนวันที่ (YYYY-MM-DD) จาก ISO string
const getDateOnlyString = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

// ฟังก์ชันสำหรับตัดรหัสสินค้าและแปลงเป็นรูปแบบที่ต้องการ
const formatItemName = (itemName) => {
  if (!itemName) return '';
  
  // แยกชื่อสินค้าและรหัส ID ยาว
  const parts = itemName.split(' ');
  
  // ตัดส่วนรหัส ID ยาวออก
  return parts.filter(part => !part.includes('-')).join(' ');
};

// ฟังก์ชันสำหรับดึงรหัสสินค้าสั้น (เช่น P101)
const extractProductCode = (itemName) => {
  if (!itemName) return '';
  
  // กรณีที่ชื่อสินค้าเริ่มต้นด้วย P ตามด้วยตัวเลข (เช่น P101)
  const match = itemName.match(/^(P\d+)/);
  return match ? match[1] : '';
};

const usePO = () => {
  // ใช้ useRef เพื่อป้องกัน infinite loop
  const isInventoryLoaded = useRef(false);
  const isSalesLoaded = useRef(false);
  const recalculationRef = useRef(false); // เพิ่มบรรทัดนี้

  
  const [items, setItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [targetCoverageDate, setTargetCoverageDate] = useState(null);
  const [futureDates, setFutureDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeStocks, setStoreStocks] = useState({});
  const [editingBuffers, setEditingBuffers] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState(null);
  const [showSendLineDialog, setShowSendLineDialog] = useState(false);
  const [showCreatePODialog, setShowCreatePODialog] = useState(false);
  const [lineGroups, setLineGroups] = useState([]);
  const [lineMessage, setLineMessage] = useState('');
  const [lineNote, setLineNote] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  
  // Create future dates for projection when delivery date changes
  useEffect(() => {
    const generateFutureDates = () => {
      const dates = [];
      const current = new Date(deliveryDate);
      
      // Create 3 future dates starting from delivery date
      for (let i = 0; i < 3; i++) {
        const date = new Date(current);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
      
      setFutureDates(dates);
      
      // Default target date to delivery date + 2 (third day)
      if (!targetCoverageDate || targetCoverageDate < current) {
        const defaultTarget = new Date(current);
        defaultTarget.setDate(defaultTarget.getDate() + 2);
        setTargetCoverageDate(defaultTarget);
      }
    };
    
    generateFutureDates();
  }, [deliveryDate, targetCoverageDate]);

  // Load inventory data
  useEffect(() => {
    // Prevent multiple loads
    if (isInventoryLoaded.current) return;
    
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch inventory data
        const inventoryData = await fetchInventoryData();
        console.log('Inventory data loaded:', inventoryData);
        
        if (!inventoryData || !Array.isArray(inventoryData) || inventoryData.length === 0) {
          console.warn('No inventory data available or invalid format');
          setError(new Error('ไม่พบข้อมูลสินค้าในระบบหรือข้อมูลไม่ถูกต้อง'));
          setLoading(false);
          return;
        }
        
        // กรอง stores ที่ไม่ต้องการออก
        const filteredInventoryData = inventoryData.filter(item => 
          item && 
          item.store_name && 
          !item.store_name.includes("รถส่งของ") && 
          !item.store_name.includes("อื่นๆ")
        );
        
        if (filteredInventoryData.length === 0) {
          setError(new Error('ไม่พบข้อมูลสินค้าหลังจากกรองข้อมูล'));
          setLoading(false);
          return;
        }
        
        // สร้าง map เพื่อรวมข้อมูลสินค้าเดียวกันจากหลายสาขา
        const itemsMap = new Map();
        
        filteredInventoryData.forEach(item => {
          if (!item || !item.item_id) return;
          
          const itemId = item.item_id;
          const formattedItemName = formatItemName(item.item_name || '');
          const productCode = extractProductCode(item.item_name || '');
          
          // ถ้ามีสินค้านี้แล้วในแมพ ให้เพิ่มยอดสต็อก
          if (itemsMap.has(itemId)) {
            const existingItem = itemsMap.get(itemId);
            existingItem.currentStock += (item.in_stock || 0);
            
            // เก็บข้อมูลสต็อกตามสาขา
            if (!existingItem.stockByStore) {
              existingItem.stockByStore = [];
            }
            
            existingItem.stockByStore.push({
              store_name: item.store_name || 'ไม่ระบุสาขา',
              in_stock: item.in_stock || 0
            });
          } else {
            // สร้างข้อมูลสินค้าใหม่
            const newItem = {
              id: itemId,
              name: formattedItemName || 'ไม่ระบุชื่อ',
              code: productCode,
              currentStock: item.in_stock || 0,
              supplier: item.supplier_name || 'ไม่ระบุซัพพลายเออร์',
              category: item.category_name || 'ไม่ระบุหมวดหมู่',
              buffer: 0, // จะถูกอัปเดตในภายหลัง
              dailySales: {},
              stockByStore: [{
                store_name: item.store_name || 'ไม่ระบุสาขา',
                in_stock: item.in_stock || 0
              }],
              orderQuantity: 0,
              suggestedOrderQuantity: 0
            };
            
            itemsMap.set(itemId, newItem);
          }
        });
        
        // แปลงแมพเป็นอาร์เรย์
        const processedItems = Array.from(itemsMap.values());
        
        // Process store stocks
        const storeStocksObj = {};
        processedItems.forEach(item => {
          storeStocksObj[item.id] = {};
          
          if (Array.isArray(item.stockByStore)) {
            item.stockByStore.forEach(store => {
              const storeName = store.store_name;
              const quantity = store.in_stock || 0;
              storeStocksObj[item.id][storeName] = quantity;
            });
          }
        });
        
        setStoreStocks(storeStocksObj);
        
        // Fetch buffer settings for each item
        try {
          const itemIds = processedItems.map(item => item.id);
          if (itemIds.length > 0) {
            console.log(`Fetching buffer settings for ${itemIds.length} items`);
            const bufferSettings = await fetchBufferSettings(itemIds);
            
            // ตั้งค่า buffer สำหรับแต่ละรายการ
            processedItems.forEach(item => {
              item.buffer = bufferSettings[item.id] || 10; // default to 10 if not found
            });
            console.log("Successfully applied buffer settings to items");
          }
        } catch (bufferError) {
          console.warn('Error fetching buffer settings, using default values:', bufferError);
          // ถ้าไม่สามารถดึง buffer ได้ ใช้ค่าเริ่มต้น
          processedItems.forEach(item => {
            item.buffer = 10; // default buffer value
          });
        }
        
        setItems(processedItems);
        
        // Group items by supplier
        const groupedBySupplier = processedItems.reduce((groups, item) => {
          const supplier = item.supplier || 'ไม่ระบุซัพพลายเออร์';
          if (!groups[supplier]) {
            groups[supplier] = [];
          }
          groups[supplier].push(item);
          return groups;
        }, {});
        
        // Sort suppliers according to predefined order
        const sortedGroups = {};
        
        // First add suppliers in the predefined order
        supplierOrder.forEach(supplier => {
          if (groupedBySupplier[supplier]) {
            sortedGroups[supplier] = groupedBySupplier[supplier];
          }
        });
        
        // Then add any other suppliers
        Object.keys(groupedBySupplier).forEach(supplier => {
          if (!supplierOrder.includes(supplier)) {
            sortedGroups[supplier] = groupedBySupplier[supplier];
          }
        });
        
        setGroupedItems(sortedGroups);
        isInventoryLoaded.current = true;
        
      } catch (err) {
        console.error("Error loading inventory data:", err);
        setError(err);
        setAlert({
          message: "ไม่สามารถโหลดข้อมูลได้",
          type: "error",
          description: err.message || "กรุณาตรวจสอบการเชื่อมต่อเครือข่าย"
        });
      }
    };
    
    loadInventory();
  }, []); // โหลดข้อมูล inventory เพียงครั้งเดียวตอนเริ่มต้น
  
  // Load sales data when dates change or inventory loaded
  useEffect(() => {
    // ถ้ายังไม่มีข้อมูลสินค้าหรือไม่มีวันที่ ให้ return
    if (items.length === 0 || futureDates.length === 0 || !targetCoverageDate) return;
    
    // ถ้าโหลดข้อมูลยอดขายแล้ว และไม่มีการเปลี่ยนแปลงวันที่ ไม่ต้องโหลดใหม่
    if (isSalesLoaded.current) return;
    
    const loadSalesData = async () => {
      try {
        // Calculate date range for sales data
        const oneWeekBefore = new Date(deliveryDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        
        const endDateObj = targetCoverageDate || futureDates[2];
        
        // ปรับปรุงให้เวลาที่ส่งเป็น evening time (17:00:00) และ end time (16:59:59.999)
        // เพื่อให้ครอบคลุมทั้งวันในเขตเวลาไทย
        const startDateISO = new Date(oneWeekBefore);
        startDateISO.setHours(17, 0, 0, 0); // 17:00:00 UTC = 00:00 GMT+7
        
        const endDateISO = new Date(endDateObj);
        endDateISO.setHours(16, 59, 59, 999); // 16:59:59.999 UTC = 23:59:59.999 GMT+7
        
        console.log(`Fetching sales data: ${startDateISO.toISOString()} to ${endDateISO.toISOString()}`);
        
        const salesDataResponse = await fetchSalesByDay(
          startDateISO.toISOString(),
          endDateISO.toISOString()
        );
        
        console.log('Sales data loaded:', salesDataResponse);
        setSalesData(salesDataResponse);
        
        // Process sales data into the items
        if (salesDataResponse && Array.isArray(salesDataResponse)) {
          const updatedItems = [...items];
          
          salesDataResponse.forEach(sale => {
            console.log("Processing sale:", sale.item_id, sale.item_name, sale.sale_date, sale.total_quantity);

            try {
              // สร้าง dateStr ในรูปแบบ ISO ตัดเวลาออก (YYYY-MM-DD)
              const dateStr = typeof sale.sale_date === 'string' 
                ? sale.sale_date.split('T')[0]  // ถ้าเป็น string แล้ว ตัดเอาแค่ส่วนวันที่
                : new Date(sale.sale_date).toISOString().split('T')[0];  // ถ้าเป็น object แปลงเป็น string ก่อน
              
              // Find the item and add the sale
              const itemIndex = updatedItems.findIndex(i => i.id === sale.item_id);
              if (itemIndex !== -1) {
                if (!updatedItems[itemIndex].dailySales) {
                  updatedItems[itemIndex].dailySales = {};
                }
                updatedItems[itemIndex].dailySales[dateStr] = sale.total_quantity || 0;
              }
            } catch (err) {
              console.warn('Error processing sale item:', err, sale);
            }
          });
          
          setItems(updatedItems);
          
          // Update grouped items
          const newGroupedItems = {};
          Object.keys(groupedItems).forEach(supplier => {
            newGroupedItems[supplier] = groupedItems[supplier].map(groupItem => {
              const updatedItem = updatedItems.find(item => item.id === groupItem.id);
              return updatedItem || groupItem;
            });
          });
          
          setGroupedItems(newGroupedItems);
          
          // Calculate projected sales with updated data
          calculateProjectedSales(updatedItems, targetCoverageDate);
          isSalesLoaded.current = true;
        }
      } catch (err) {
        console.error("Error loading sales data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSalesData();
  }, [deliveryDate, items.length, futureDates, targetCoverageDate, groupedItems]); 
  
 // แก้ไขฟังก์ชัน calculateProjectedSales ในไฟล์ usePO.js
// (ค้นหาและแทนที่เฉพาะฟังก์ชันนี้)

// Calculate projected sales and suggested order quantities
const calculateProjectedSales = useCallback((itemsToCalculate, targetDate) => {
  if (!targetDate || !Array.isArray(itemsToCalculate) || itemsToCalculate.length === 0) {
    console.warn('Invalid inputs for calculateProjectedSales');
    return itemsToCalculate;
  }
  
  try {
    // ใช้วันที่ (เฉพาะ YYYY-MM-DD) โดยตัดเวลาออก
    const targetDateStr = getDateOnlyString(formatDateForAPI(targetDate));
    console.log("Target date for calculation:", targetDateStr);

    // Sort dates in ascending order for accumulation
    const sortedDates = futureDates
      .map(date => getDateOnlyString(formatDateForAPI(date)))
      .sort();
    
    // Clone items to avoid mutations while calculating
    const updatedItems = itemsToCalculate.map(item => {
      // Start with current stock
      let remainingStock = item.currentStock;
      
      // Calculate remaining stock for each day
      const projectedStock = {};
      let accumulatedSales = 0;
      
      sortedDates.forEach(dateStr => {
        const dailySale = (item.dailySales && item.dailySales[dateStr]) || 0;
        accumulatedSales += dailySale;
        remainingStock -= dailySale;
        projectedStock[dateStr] = remainingStock;
      });
      
      // Determine if we need to order based on target date
      let suggestedQuantity = 0;
      
      // If projected stock on target date is negative, we need to order
      if (projectedStock[targetDateStr] < 0) {
        // Order enough to cover negative stock plus the buffer
        suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + (item.buffer || 0);
      } else if (projectedStock[targetDateStr] < (item.buffer || 0)) {
        // If projected stock is less than buffer, order to reach buffer level
        suggestedQuantity = (item.buffer || 0) - projectedStock[targetDateStr];
      }
      
      // Round up suggested quantity
      suggestedQuantity = Math.ceil(suggestedQuantity);
      
      return {
        ...item,
        projectedStock,
        accumulatedSales,
        suggestedOrderQuantity: suggestedQuantity,
        orderQuantity: suggestedQuantity // Default order quantity to suggested
      };
    });
    
    // กำหนด state ครั้งเดียว ไม่เรียกซ้ำ
    return updatedItems;
  } catch (err) {
    console.error('Error calculating projected sales:', err);
    return itemsToCalculate; // กรณีเกิด error ให้คืนค่าเดิม
  }
}, [futureDates]);

// แก้ไข useEffect สำหรับโหลดข้อมูลยอดขาย

// Load sales data when dates change or inventory loaded
useEffect(() => {
  // ถ้ายังไม่มีข้อมูลสินค้าหรือไม่มีวันที่ ให้ return
  if (items.length === 0 || futureDates.length === 0 || !targetCoverageDate) return;
  
  // ถ้าโหลดข้อมูลยอดขายแล้ว ไม่ต้องโหลดใหม่
  if (isSalesLoaded.current) return;
  
  const loadSalesData = async () => {
    try {
      // Calculate date range for sales data
      const oneWeekBefore = new Date(deliveryDate);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
      
      const endDateObj = targetCoverageDate || futureDates[2];
      
      // ปรับปรุงให้เวลาที่ส่งเป็น evening time (17:00:00) และ end time (16:59:59.999)
      // เพื่อให้ครอบคลุมทั้งวันในเขตเวลาไทย
      const startDateISO = new Date(futureDates[0]);
      startDateISO.setDate(startDateISO.getDate() - 7); // ย้อนหลัง 7 วัน
          
      const endDateISO = new Date(futureDates[futureDates.length - 1]);
      endDateISO.setDate(endDateISO.getDate() + 1); // เพิ่มอีก 1 วัน
          
      console.log(`Fetching sales data: ${startDateISO.toISOString()} to ${endDateISO.toISOString()}`);
      
      const salesDataResponse = await fetchSalesByDay(
        startDateISO.toISOString(),
        endDateISO.toISOString()
      );
      
      console.log('Sales data loaded:', salesDataResponse);
      setSalesData(salesDataResponse);
      
      // Process sales data into the items
      if (salesDataResponse && Array.isArray(salesDataResponse)) {
        let hasUpdates = false;
        const updatedItems = [...items];
        
        salesDataResponse.forEach(sale => {
          try {
            // ตรวจสอบว่ามี item_id ในข้อมูลยอดขายหรือไม่
            const saleItemId = sale.item_id || '';
            
            // ถ้ามี item_id ชัดเจน ใช้เลย
            const itemIndex = updatedItems.findIndex(i => 
              i.id === saleItemId ||
              i.code === saleItemId
            );
            
            if (itemIndex !== -1) {
              // สร้าง dateStr ในรูปแบบ ISO ตัดเวลาออก (YYYY-MM-DD)
              const dateStr = typeof sale.sale_date === 'string' 
                ? sale.sale_date.split('T')[0]  // ถ้าเป็น string แล้ว ตัดเอาแค่ส่วนวันที่
                : new Date(sale.sale_date).toISOString().split('T')[0];  // ถ้าเป็น object แปลงเป็น string ก่อน
              
              // กำหนดค่า dailySales
              if (!updatedItems[itemIndex].dailySales) {
                updatedItems[itemIndex].dailySales = {};
              }
              
              // เก็บยอดขาย
              updatedItems[itemIndex].dailySales[dateStr] = sale.total_quantity || 0;
              hasUpdates = true;
              console.log(`Added sale for ${updatedItems[itemIndex].name}: ${sale.total_quantity} on ${dateStr}`);
            } else if (sale.item_name) {
              // ถ้าไม่มี item_id ที่ตรงกัน ลองหาจาก item_name
              const codeMatch = sale.item_name.match(/^(P\d+)/);
              if (codeMatch) {
                const code = codeMatch[1];
                const altItemIndex = updatedItems.findIndex(i => i.code === code);
                
                if (altItemIndex !== -1) {
                  // สร้าง dateStr
                  const dateStr = typeof sale.sale_date === 'string' 
                    ? sale.sale_date.split('T')[0]
                    : new Date(sale.sale_date).toISOString().split('T')[0];
                  
                  // กำหนดค่า dailySales
                  if (!updatedItems[altItemIndex].dailySales) {
                    updatedItems[altItemIndex].dailySales = {};
                  }
                  
                  // เก็บยอดขาย
                  updatedItems[altItemIndex].dailySales[dateStr] = sale.total_quantity || 0;
                  hasUpdates = true;
                  console.log(`Added sale by code for ${updatedItems[altItemIndex].name}: ${sale.total_quantity} on ${dateStr}`);
                }
              }
            }
          } catch (err) {
            console.warn('Error processing sale item:', err, sale);
          }
        });
        
        if (hasUpdates) {
          setItems(updatedItems);
          
          // Update grouped items
          const newGroupedItems = {};
          Object.keys(groupedItems).forEach(supplier => {
            newGroupedItems[supplier] = groupedItems[supplier].map(groupItem => {
              const updatedItem = updatedItems.find(item => item.id === groupItem.id);
              return updatedItem || groupItem;
            });
          });
          
          setGroupedItems(newGroupedItems);
          
          // Calculate projections with the updated data, but don't update state inside calculateProjectedSales
          const processedItems = calculateProjectedSales(updatedItems, targetCoverageDate);
          
          // เมื่อได้ข้อมูลที่คำนวณแล้ว นำมา update state เอง
          if (processedItems && processedItems.length > 0) {
            setItems(processedItems);
            
            // Update grouped items with processed data
            const processedGroupedItems = {};
            Object.keys(groupedItems).forEach(supplier => {
              processedGroupedItems[supplier] = groupedItems[supplier].map(groupItem => {
                const processedItem = processedItems.find(item => item.id === groupItem.id);
                return processedItem || groupItem;
              });
            });
            
            setGroupedItems(processedGroupedItems);
          }
        }
      }
      
      // สำคัญ: ตั้งค่าว่าได้โหลดข้อมูลแล้ว
      isSalesLoaded.current = true;
    } catch (err) {
      console.error("Error loading sales data:", err);
    } finally {
      setLoading(false);
    }
  };
  
  loadSalesData();
}, [deliveryDate, items.length, futureDates, targetCoverageDate, groupedItems, calculateProjectedSales]);

// แก้ไข useEffect สำหรับ target date changed
// Update calculations when target date changes
// แก้ไข useEffect สำหรับ target date changed
useEffect(() => {
  // ป้องกันการรัน useEffect นี้บ่อยเกินไป
  if (!targetCoverageDate || items.length === 0 || loading) return;
  
  // ถ้ากำลังคำนวณอยู่ ไม่ต้องคำนวณซ้ำ
  if (recalculationRef.current) return;
  
  recalculationRef.current = true;
  const processedItems = calculateProjectedSales(items, targetCoverageDate);
  
  if (processedItems && processedItems.length > 0) {
    setItems(processedItems);
    
    // Update grouped items
    const newGroupedItems = {};
    Object.keys(groupedItems).forEach(supplier => {
      newGroupedItems[supplier] = groupedItems[supplier].map(groupItem => {
        const updatedItem = processedItems.find(item => item.id === groupItem.id);
        return updatedItem || groupItem;
      });
    });
    
    setGroupedItems(newGroupedItems);
  }
  
  // Reset ref ให้สามารถคำนวณอีกครั้งในการ render ถัดไป
  setTimeout(() => {
    recalculationRef.current = false;
  }, 100); // เพิ่มเวลาเป็น 100ms เพื่อให้มั่นใจว่า render เสร็จก่อน
}, [targetCoverageDate, items, loading, calculateProjectedSales, groupedItems]);

  // Update buffer quantities
  const handleBufferChange = useCallback((itemId, value) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            buffer: value
          };
          
          // Recalculate suggested quantity if target date exists
          if (targetCoverageDate) {
            const targetDateStr = getDateOnlyString(formatDateForAPI(targetCoverageDate));
            const projectedStock = item.projectedStock || {};
            
            let suggestedQuantity = 0;
            if (projectedStock[targetDateStr] < 0) {
              suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + value;
            } else if (projectedStock[targetDateStr] < value) {
              suggestedQuantity = value - projectedStock[targetDateStr];
            }
            
            updatedItem.suggestedOrderQuantity = Math.ceil(suggestedQuantity);
            updatedItem.orderQuantity = Math.ceil(suggestedQuantity);
          }
          
          return updatedItem;
        }
        return item;
      })
    );
    
    // Update in grouped items too
    setGroupedItems(prevGrouped => {
      const newGrouped = {};
      Object.keys(prevGrouped).forEach(supplier => {
        newGrouped[supplier] = prevGrouped[supplier].map(groupItem => {
          if (groupItem.id === itemId) {
            const updatedItem = {
              ...groupItem,
              buffer: value
            };
            
            // Recalculate suggested quantity if target date exists
            if (targetCoverageDate) {
              const targetDateStr = getDateOnlyString(formatDateForAPI(targetCoverageDate));
              const projectedStock = groupItem.projectedStock || {};
              
              let suggestedQuantity = 0;
              if (projectedStock[targetDateStr] < 0) {
                suggestedQuantity = Math.abs(projectedStock[targetDateStr]) + value;
              } else if (projectedStock[targetDateStr] < value) {
                suggestedQuantity = value - projectedStock[targetDateStr];
              }
              
              updatedItem.suggestedOrderQuantity = Math.ceil(suggestedQuantity);
              updatedItem.orderQuantity = Math.ceil(suggestedQuantity);
            }
            
            return updatedItem;
          }
          return groupItem;
        });
      });
      return newGrouped;
    });
  }, [targetCoverageDate]);
  
  // Update order quantities
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
    
    // Update in grouped items too
    setGroupedItems(prevGrouped => {
      const newGrouped = {};
      Object.keys(prevGrouped).forEach(supplier => {
        newGrouped[supplier] = prevGrouped[supplier].map(groupItem => {
          if (groupItem.id === itemId) {
            return {
              ...groupItem,
              orderQuantity: value
            };
          }
          return groupItem;
        });
      });
      return newGrouped;
    });
  }, []);
  
  // Save buffer settings
  const handleSaveBuffers = useCallback(async () => {
    setProcessingAction(true);
    try {
      // Prepare buffer settings data for API
      const bufferSettings = items.map(item => ({
        item_id: item.id,
        reserve_quantity: item.buffer || 0
      }));
      
      const result = await saveBufferSettings(bufferSettings);
      
      if (result.success) {
        setAlert({
          message: result.offline 
            ? "บันทึกยอดเผื่อสำเร็จ (โหมดออฟไลน์)" 
            : "บันทึกยอดเผื่อสำเร็จ",
          type: "success",
          description: result.offline 
            ? "ข้อมูลจะถูกซิงค์เมื่อมีการเชื่อมต่ออินเทอร์เน็ต" 
            : undefined
        });
        
        setEditingBuffers(false);
      } else {
        throw new Error(result.message || "ไม่สามารถบันทึกได้");
      }
    } catch (err) {
      console.error("Error saving buffer settings:", err);
      setAlert({
        message: "ไม่สามารถบันทึกยอดเผื่อได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [items]);
  
  // Generate LINE notification by supplier
  const generateSupplierMessage = useCallback((supplier, supplierItems) => {
    const itemsWithQty = supplierItems.filter(item => item.orderQuantity > 0);
    
    if (itemsWithQty.length === 0) return '';
    
    let message = `**${supplier}**\n`;
    itemsWithQty.forEach((item, idx) => {
      message += `${idx + 1}. ${item.code ? `${item.code} ` : ''}${item.name} จำนวน ${item.orderQuantity} ชิ้น\n`;
    });
    
    return message + '\n';
  }, []);
  
  // Open LINE notification dialog
  const handleOpenSendLineDialog = useCallback(() => {
    // Generate default message if empty
    if (!lineMessage) {
      let message = `รายการสั่งซื้อสินค้า วันที่ ${deliveryDate.toLocaleDateString('th-TH')}\n\n`;
      
      // Generate message by supplier
      Object.entries(groupedItems).forEach(([supplier, supplierItems]) => {
        const supplierMessage = generateSupplierMessage(supplier, supplierItems);
        if (supplierMessage) {
          message += supplierMessage;
        }
      });
      
      setLineMessage(message);
    }
    
    setShowSendLineDialog(true);
  }, [groupedItems, deliveryDate, lineMessage, generateSupplierMessage]);
  
  // Close LINE notification dialog
  const handleCloseSendLineDialog = useCallback(() => {
    setShowSendLineDialog(false);
  }, []);
  
  // Send LINE notification
  const handleSendLineNotification = useCallback(async () => {
    setProcessingAction(true);
    try {
      if (selectedSupplier) {
        // ส่งเฉพาะซัพพลายเออร์ที่เลือก
        const supplierItems = groupedItems[selectedSupplier] || [];
        const itemsToSend = supplierItems.filter(item => item.orderQuantity > 0);
        
        if (itemsToSend.length === 0) {
          throw new Error(`ไม่มีรายการสั่งซื้อสำหรับ ${selectedSupplier}`);
        }
        
        // Prepare notification data for API
        const notificationData = {
          group_ids: lineGroups,
          po: {
            supplier_name: selectedSupplier,
            po_number: `PO-${getDateOnlyString(formatDateForAPI(new Date()))}`,
            delivery_date: formatDateForAPI(deliveryDate),
            total_amount: itemsToSend.reduce((total, item) => 
              total + (item.orderQuantity * (item.unit_price || 0)), 0),
            items: itemsToSend.map(item => ({
              item_name: `${item.code} ${item.name}`.trim(),
              quantity: item.orderQuantity
            }))
          }
        };
        
        // Override default message if custom message is provided
        if (lineMessage) {
          notificationData.custom_message = lineMessage;
        }
        
        // Add note if provided
        if (lineNote) {
          notificationData.note = lineNote;
        }
        
        await sendLineNotification(notificationData);
      } else {
        // ส่งแยกตามซัพพลายเออร์
        for (const [supplier, supplierItems] of Object.entries(groupedItems)) {
          const itemsToSend = supplierItems.filter(item => item.orderQuantity > 0);
          
          if (itemsToSend.length === 0) continue;
          
          // สร้างข้อความเฉพาะสำหรับซัพพลายเออร์นี้
          let supplierMessage = `รายการสั่งซื้อสินค้า ${supplier} วันที่ ${deliveryDate.toLocaleDateString('th-TH')}\n\n`;
          
          itemsToSend.forEach((item, idx) => {
            supplierMessage += `${idx + 1}. ${item.code ? `${item.code} ` : ''}${item.name} จำนวน ${item.orderQuantity} ชิ้น\n`;
          });
          
          // Prepare notification data for API
          const notificationData = {
            group_ids: lineGroups,
            po: {
              supplier_name: supplier,
              po_number: `PO-${getDateOnlyString(formatDateForAPI(new Date()))}-${supplier}`,
              delivery_date: formatDateForAPI(deliveryDate),
              total_amount: itemsToSend.reduce((total, item) => 
                total + (item.orderQuantity * (item.unit_price || 0)), 0),
              items: itemsToSend.map(item => ({
                item_name: `${item.code} ${item.name}`.trim(),
                quantity: item.orderQuantity
              }))
            },
            custom_message: supplierMessage
          };
          
          // Add note if provided
          if (lineNote) {
            notificationData.note = lineNote;
          }
          
          await sendLineNotification(notificationData);
        }
      }
      
      setAlert({
        message: "ส่งแจ้งเตือน LINE สำเร็จ",
        type: "success"
      });
      
      setShowSendLineDialog(false);
    } catch (err) {
      console.error("Error sending LINE notification:", err);
      setAlert({
        message: "ไม่สามารถส่งแจ้งเตือน LINE ได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [groupedItems, deliveryDate, lineGroups, lineMessage, lineNote, selectedSupplier]);
  
  // Open create PO dialog
  const handleOpenCreatePODialog = useCallback(() => {
    setShowCreatePODialog(true);
  }, []);
  
  // Close create PO dialog
  const handleCloseCreatePODialog = useCallback(() => {
    setShowCreatePODialog(false);
  }, []);
  
  // Create purchase order
  const handleCreatePO = useCallback(async () => {
    setProcessingAction(true);
    try {
      if (selectedSupplier) {
        // สร้าง PO เฉพาะซัพพลายเออร์ที่เลือก
        const supplierItems = groupedItems[selectedSupplier] || [];
        const itemsToOrder = supplierItems
          .filter(item => item.orderQuantity > 0)
          .map(item => ({
            item_id: item.id,
            item_name: `${item.code} ${item.name}`.trim(),
            quantity: item.orderQuantity,
            suggested_quantity: item.suggestedOrderQuantity,
            unit_price: item.unit_price || 0,
            total_price: item.orderQuantity * (item.unit_price || 0),
            buffer: item.buffer || 0,
            current_stock: item.currentStock || 0,
            projected_stock: (item.currentStock || 0) - (item.buffer || 0)
          }));
        
        if (itemsToOrder.length === 0) {
          throw new Error(`ไม่มีรายการสั่งซื้อสำหรับ ${selectedSupplier}`);
        }
        
        // Calculate total amount
        const totalAmount = itemsToOrder.reduce(
          (total, item) => total + item.total_price, 0
        );
        
        // Create PO data for API
        const poData = {
          supplier_id: selectedSupplier,
          supplier_name: selectedSupplier,
          status: "pending",
          delivery_date: formatDateForAPI(deliveryDate),
          target_coverage_date: formatDateForAPI(targetCoverageDate || deliveryDate),
          total_amount: totalAmount,
          items: itemsToOrder,
          notes: "",
          created_by: "system"
        };
        
        const createdPO = await createPO(poData);
        
        setAlert({
          message: `สร้างใบสั่งซื้อสำหรับ ${selectedSupplier} สำเร็จ`,
          type: "success",
          description: `เลขที่ใบสั่งซื้อ: ${createdPO.po_number || 'PO-TEMP'}`
        });
      } else {
        // สร้าง PO แยกตามซัพพลายเออร์
        let successCount = 0;
        
        for (const [supplier, supplierItems] of Object.entries(groupedItems)) {
          const itemsToOrder = supplierItems
            .filter(item => item.orderQuantity > 0)
            .map(item => ({
              item_id: item.id,
              item_name: `${item.code} ${item.name}`.trim(),
              quantity: item.orderQuantity,
              suggested_quantity: item.suggestedOrderQuantity,
              unit_price: item.unit_price || 0,
              total_price: item.orderQuantity * (item.unit_price || 0),
              buffer: item.buffer || 0,
              current_stock: item.currentStock || 0,
              projected_stock: (item.currentStock || 0) - (item.buffer || 0)
            }));
          
          if (itemsToOrder.length === 0) continue;
          
          // Calculate total amount
          const totalAmount = itemsToOrder.reduce(
            (total, item) => total + item.total_price, 0
          );
          
          // Create PO data for API
          const poData = {
            supplier_id: supplier,
            supplier_name: supplier,
            status: "pending",
            delivery_date: formatDateForAPI(deliveryDate),
            target_coverage_date: formatDateForAPI(targetCoverageDate || deliveryDate),
            total_amount: totalAmount,
            items: itemsToOrder,
            notes: "",
            created_by: "system"
          };
          
          await createPO(poData);
          successCount++;
        }
        
        if (successCount > 0) {
          setAlert({
            message: `สร้างใบสั่งซื้อสำเร็จ ${successCount} ใบ`,
            type: "success"
          });
        } else {
          throw new Error("ไม่มีรายการสั่งซื้อที่เลือก");
        }
      }
      
      setShowCreatePODialog(false);
    } catch (err) {
      console.error("Error creating PO:", err);
      setAlert({
        message: "ไม่สามารถสร้างใบสั่งซื้อได้",
        type: "error",
        description: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  }, [groupedItems, selectedSupplier, deliveryDate, targetCoverageDate]);
  
  // Update calculations when target date changes
  useEffect(() => {
    // ให้คำนวณเฉพาะเมื่อเปลี่ยน targetCoverageDate และมีข้อมูลพร้อม
    if (targetCoverageDate && items.length > 0 && !loading) {
      calculateProjectedSales(items, targetCoverageDate);
    }
  }, [targetCoverageDate, items, loading, calculateProjectedSales]);
  
  return {
    items,
    groupedItems,
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
    selectedSupplier,
    setSelectedSupplier,
    // UI state
    alert,
    setAlert,
    error,
    // Sales data
    salesData
  };
};

export default usePO;