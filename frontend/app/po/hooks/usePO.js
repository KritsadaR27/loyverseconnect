// app/po/hooks/usePO.js
import { useState, useEffect, useCallback, useRef ,useMemo} from 'react';
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
const transformSalesData = (salesData, items) => {
  // ถ้าไม่มีข้อมูลยอดขาย หรือเป็น array ว่าง ให้คืนค่า map ว่าง
  if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
    console.log("No sales data to transform");
    return {};
  }

  // สร้าง Map เพื่อเก็บข้อมูลยอดขายแยกตามสินค้า
  const salesMap = {};

  // วนลูปข้อมูลยอดขาย และเก็บลงใน map
  salesData.forEach(sale => {
    try {
      // สร้างรูปแบบวันที่ให้เป็น YYYY-MM-DD แบบเดียวกัน
      let dateStr = '';
      if (typeof sale.sale_date === 'string') {
        const dateParts = sale.sale_date.split('T')[0];
        dateStr = dateParts;
      } else if (sale.sale_date instanceof Date) {
        dateStr = getFormattedDate(sale.sale_date);
      } else {
        console.warn("Invalid date format:", sale.sale_date);
        return; // ข้ามข้อมูลที่มีปัญหา
      }
      
      // สกัด item_id และ item_name
      const itemId = sale.item_id || '';
      const itemName = sale.item_name || '';
      const quantity = sale.total_quantity || 0;
      
      // หาสินค้าที่ตรงกับข้อมูลยอดขาย โดยพยายามจับคู่ทั้ง ID และชื่อ
      let matchedItems = [];
      
      // ถ้ามี item_id ให้ใช้ item_id เป็นหลัก
      if (itemId) {
        matchedItems = items.filter(item => 
          item.id === itemId || item.code === itemId
        );
      }
      
      // ถ้าไม่พบด้วย ID แต่มี item_name ให้ลองใช้ item_name
      if (matchedItems.length === 0 && itemName) {
        matchedItems = items.filter(item => {
          // พยายามจับคู่กับรหัสที่อยู่ในชื่อ (เช่น P101)
          const codeMatch = itemName.match(/^(P\d+)/);
          if (codeMatch && item.code === codeMatch[1]) {
            return true;
          }
          // หรือลองเทียบชื่อโดยตรง
          return item.name === itemName || item.name.includes(itemName) || itemName.includes(item.name);
        });
      }
      
      // บันทึกข้อมูลสำหรับทุกสินค้าที่ตรงกัน
      matchedItems.forEach(item => {
        const mapKey = item.id;
        
        if (!salesMap[mapKey]) {
          salesMap[mapKey] = {
            id: item.id,
            code: item.code,
            name: item.name,
            dailySales: {}
          };
        }
        
        // ถ้าเป็นวันเดียวกัน ให้รวมยอด
        if (salesMap[mapKey].dailySales[dateStr]) {
          salesMap[mapKey].dailySales[dateStr] += quantity;
        } else {
          salesMap[mapKey].dailySales[dateStr] = quantity;
        }
        
        console.log(`Mapped sales for ${item.name} (${item.id}): ${quantity} on ${dateStr}`);
      });
      
      // หากไม่มีสินค้าที่ตรงกัน ลองบันทึกด้วย itemId หรือ itemName
      if (matchedItems.length === 0) {
        const mapKey = itemId || itemName;
        if (mapKey) {
          if (!salesMap[mapKey]) {
            salesMap[mapKey] = {
              id: itemId,
              name: itemName,
              dailySales: {}
            };
          }
          
          if (salesMap[mapKey].dailySales[dateStr]) {
            salesMap[mapKey].dailySales[dateStr] += quantity;
          } else {
            salesMap[mapKey].dailySales[dateStr] = quantity;
          }
          
          console.log(`Mapped sales for unmatched item ${mapKey}: ${quantity} on ${dateStr}`);
        }
      }
    } catch (err) {
      console.warn('Error processing sale item:', err, sale);
    }
  });

  console.log("Transformed sales data:", salesMap);
  return salesMap;
};
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const usePO = () => {
  // ใช้ useRef เพื่อป้องกัน infinite loop
  const isInventoryLoaded = useRef(false);
  const isSalesLoaded = useRef(false);
  const recalculationRef = useRef(false); // เพิ่มบรรทัดนี้

  
  const [items, setItems] = useState([]);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [deliveryDate, setDeliveryDate] = useState(tomorrow);

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
  const [supplierFilter, setSupplierFilter] = useState(""); // เพิ่ม state เก็บซัพพลายเออร์ที่เลือก

  // ฟังก์ชัน callback สำหรับจัดการการเปลี่ยนแปลงของตัวเลือกซัพพลายเออร์
  const handleSupplierFilterChange = useCallback((selectedSupplier) => {
    console.log(`Filtering items by supplier: ${selectedSupplier}`);
    setSupplierFilter(selectedSupplier);
  }, []);
// สร้าง groupedItems ที่ผ่านการกรอง
  const filteredGroupedItems = useMemo(() => {
    if (!supplierFilter) {
      return groupedItems; // ไม่มีการกรอง คืนค่าเดิม
    }
    
    // กรองเฉพาะซัพพลายเออร์ที่เลือก
    const filtered = {};
    if (groupedItems[supplierFilter]) {
      filtered[supplierFilter] = groupedItems[supplierFilter];
    }
    
    return filtered;
  }, [groupedItems, supplierFilter]);

 
  
  // Create future dates for projection when delivery date changes
  useEffect(() => {
    const generateFutureDates = () => {
      const dates = [];
      const current = new Date(deliveryDate);
  
      for (let i = 0; i < 3; i++) {
        const date = new Date(current);
        date.setDate(date.getDate() + i);
        dates.push(date);
      }
  
      setFutureDates(dates);
  
      // ✅ ไม่ต้องเช็คเงื่อนไขแล้ว force reset ทุกครั้ง
      const defaultTarget = new Date(current);
      defaultTarget.setDate(defaultTarget.getDate() + 2);
      setTargetCoverageDate(defaultTarget);
    };
  
    generateFutureDates();
  }, [deliveryDate]); // ❗ ตัด targetCoverageDate ออกจาก dependency
  
  
  useEffect(() => {
    if (items.length === 0 || loading || !targetCoverageDate || futureDates.length === 0) return;
  
    const updated = calculateProjectedSales(items, targetCoverageDate);
    setItems(updated);
  
    // อัปเดต groupedItems ใหม่ด้วย
    const updatedGrouped = {};
    Object.keys(groupedItems).forEach(supplier => {
      updatedGrouped[supplier] = groupedItems[supplier].map(groupItem => {
        const updatedItem = updated.find(i => i.id === groupItem.id);
        return updatedItem || groupItem;
      });
    });
    setGroupedItems(updatedGrouped);
  }, [futureDates, targetCoverageDate]);
  
  
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
    if (!isInventoryLoaded.current || futureDates.length === 0 || !targetCoverageDate) return;
    if (isSalesLoaded.current) return;
  
    isSalesLoaded.current = true;
  
    const loadSalesData = async () => {
      try {
        const startDate = new Date(deliveryDate);
        startDate.setDate(startDate.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
  
        const endDate = new Date(targetCoverageDate);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
  
        const salesDataResponse = await fetchSalesByDay(
          startDate.toISOString(),
          endDate.toISOString()
        );
  
        setSalesData(salesDataResponse);
  
        const transformed = transformSalesData(salesDataResponse, items);
        const updatedItems = items.map(item => {
          const itemSales = transformed[item.id] || transformed[item.code] || {};
          return {
            ...item,
            dailySales: itemSales.dailySales || {}
          };
        });
  
        const processedItems = calculateProjectedSales(updatedItems, targetCoverageDate);
        setItems(processedItems);
  
        const newGrouped = {};
        Object.keys(groupedItems).forEach(supplier => {
          newGrouped[supplier] = groupedItems[supplier].map(groupItem => {
            const updatedItem = processedItems.find(i => i.id === groupItem.id);
            return updatedItem || groupItem;
          });
        });
        setGroupedItems(newGrouped);
  
      } catch (err) {
        console.error('Error loading sales data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    loadSalesData();
  }, [deliveryDate, futureDates, targetCoverageDate, groupedItems]);
  


// Calculate projected sales and suggested order quantities
const calculateProjectedSales = useCallback((itemsToCalculate, targetDate) => {
  if (!targetDate || !Array.isArray(itemsToCalculate) || itemsToCalculate.length === 0) {
    console.warn('Invalid inputs for calculateProjectedSales');
    return itemsToCalculate;
  }
  
  try {
    // ใช้ฟังก์ชัน helper สำหรับฟอร์แมตวันที่
    const targetDateStr = getFormattedDate(targetDate);
    console.log("Target date for calculation:", targetDateStr);

    // เตรียมวันที่ในอนาคตที่ต้องพิจารณา
    const datesToConsider = [];
    for (let futureDate of futureDates) {
      if (futureDate <= targetDate) {
        datesToConsider.push(futureDate);
      }
    }
    
    // เรียงลำดับวันที่จากวันที่ส่งของไปจนถึงวันที่ต้องการวางแผน
    datesToConsider.sort((a, b) => a - b);
    
    // แปลงให้เป็นรูปแบบ YYYY-MM-DD
    const sortedDates = datesToConsider.map(date => getFormattedDate(date));
    
    console.log("Dates to consider:", sortedDates);
    
    // Clone items เพื่อป้องกันการเปลี่ยนแปลงโดยตรง
    const updatedItems = itemsToCalculate.map(item => {
      // เริ่มต้นด้วยยอดสต็อกปัจจุบัน
      let remainingStock = item.currentStock;
      
      // คัดลอกข้อมูลยอดขายเดิม
      const dailySales = item.dailySales || {};
      
      // คำนวณสต็อกคงเหลือสำหรับแต่ละวัน
      const projectedStock = {};
      
      // ลูปผ่านวันที่ที่ต้องพิจารณา
      for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i];
        const currentDate = new Date(dateStr);
        
        // ดึงยอดขายของวันที่ตรงกันในสัปดาห์ก่อน (ย้อนหลัง 7 วัน)
        const previousWeekDate = new Date(currentDate);
        previousWeekDate.setDate(previousWeekDate.getDate() - 7);
        const previousWeekDateStr = getFormattedDate(previousWeekDate);
        
        // ใช้ยอดขายจากสัปดาห์ก่อนในวันที่เดียวกัน หรือ 0 ถ้าไม่มีข้อมูล
        const dailySale = dailySales[previousWeekDateStr] || 0;
        
        // หักยอดขายออกจากสต็อกคงเหลือ
        remainingStock -= dailySale;
        projectedStock[dateStr] = remainingStock;
        
        console.log(`${item.name} - Date: ${dateStr}, Previous Week: ${previousWeekDateStr}, Sale: ${dailySale}, Remaining: ${remainingStock}`);
      }
      
      // คำนวณยอดแนะนำตาม target date
      let suggestedQuantity = 0;
      
      // ถ้าสต็อกติดลบ ให้สั่งเพิ่มเพื่อชดเชย
      if (projectedStock[targetDateStr] < 0) {
        suggestedQuantity = Math.abs(projectedStock[targetDateStr]);
      } else {
        // ถ้าสต็อกเป็นบวก แต่น้อยกว่าค่าเผื่อ หรือเท่ากับศูนย์ ให้สั่งเพิ่มจนถึงค่าเผื่อ
        suggestedQuantity = 0;
      }
      
      // บวกเพิ่มยอดเผื่อ
      suggestedQuantity += (item.buffer || 0);
      
      // ปัดขึ้นให้เป็นจำนวนเต็ม
      suggestedQuantity = Math.ceil(suggestedQuantity);
      
      return {
        ...item,
        projectedStock,
        suggestedOrderQuantity: suggestedQuantity,
        orderQuantity: 0  // กำหนดค่าเริ่มต้นเป็น 0 แทนที่จะเท่ากับยอดแนะนำ
      };
    });
    
    return updatedItems;
  } catch (err) {
    console.error('Error calculating projected sales:', err);
    return itemsToCalculate; // กรณีเกิด error ให้คืนค่าเดิม
  }
}, [futureDates]);





// คำนวณยอดขายที่คาดการณ์ไว้เมื่อมีการเปลี่ยนแปลงใน targetCoverageDate

  // แก้ไขฟังก์ชันใน usePO.js
  const bufferChangeTimeoutRef = useRef(null);
  const isCalculatingRef = useRef(false);
  

// Update buffer quantities
const handleBufferChange = useCallback((itemId, value) => {
  const numericValue = parseInt(value) || 0;

  // อัปเดต buffer ก่อน
  const updatedItems = items.map(item => {
    if (item.id === itemId) {
      return { ...item, buffer: numericValue };
    }
    return item;
  });

  setItems(updatedItems);

  // คำนวณใหม่ทุกแถว (ไม่ใช้ debounce)
  const recalculatedItems = calculateProjectedSales(updatedItems, targetCoverageDate);
  setItems(recalculatedItems);

  // อัปเดต groupedItems ตามใหม่
  const newGrouped = {};
  Object.keys(groupedItems).forEach(supplier => {
    newGrouped[supplier] = groupedItems[supplier].map(groupItem => {
      const updated = recalculatedItems.find(i => i.id === groupItem.id);
      return updated || groupItem;
    });
  });
  setGroupedItems(newGrouped);
}, [items, targetCoverageDate, groupedItems, calculateProjectedSales]);

// เพิ่มยอดสั่งเป็นยอดแนะนำทั้งหมด
const applyAllSuggestedQuantities = useCallback(() => {
  console.log('Applying all suggested quantities as order quantities');
  
  setItems(prevItems => 
    prevItems.map(item => ({
      ...item,
      orderQuantity: item.suggestedOrderQuantity
    }))
  );
  
  setGroupedItems(prevGrouped => {
    const newGrouped = {};
    Object.keys(prevGrouped).forEach(supplier => {
      newGrouped[supplier] = prevGrouped[supplier].map(groupItem => ({
        ...groupItem,
        orderQuantity: groupItem.suggestedOrderQuantity
      }));
    });
    return newGrouped;
  });
  
  setAlert({
    message: "นำยอดแนะนำมาใช้เป็นยอดสั่งทั้งหมดแล้ว",
    type: "success"
  });
}, [setAlert]);

// ล้างยอดสั่งทั้งหมดเป็น 0
const clearAllOrderQuantities = useCallback(() => {
  console.log('Clearing all order quantities to zero');
  
  setItems(prevItems => 
    prevItems.map(item => ({
      ...item,
      orderQuantity: 0
    }))
  );
  
  setGroupedItems(prevGrouped => {
    const newGrouped = {};
    Object.keys(prevGrouped).forEach(supplier => {
      newGrouped[supplier] = prevGrouped[supplier].map(groupItem => ({
        ...groupItem,
        orderQuantity: 0
      }));
    });
    return newGrouped;
  });
  
  setAlert({
    message: "ล้างยอดสั่งทั้งหมดเป็น 0 แล้ว",
    type: "success"
  });
}, [setAlert]);
// Update order quantities
// แก้ไขฟังก์ชัน handleOrderQuantityChange ใน usePO.js เพื่อแก้ปัญหาตัวเลขกลับไปค่าเดิม

// Update order quantities
const handleOrderQuantityChange = useCallback((itemId, value) => {
  console.log(`Updating order quantity for item ${itemId} to ${value}`);
  
  // แปลงค่าเป็นตัวเลข และใช้ 0 ถ้าไม่สามารถแปลงได้
  const numericValue = parseInt(value) || 0;
  
  // อัปเดตค่าใน items โดยตรง และไม่เรียกฟังก์ชันคำนวณอื่นใดเพิ่มเติม
  setItems(prevItems => 
    prevItems.map(item => {
      if (item.id === itemId) {
        console.log(`Found item ${itemId}, changing orderQuantity from ${item.orderQuantity} to ${numericValue}`);
        return {
          ...item,
          orderQuantity: numericValue
        };
      }
      return item;
    })
  );
  
  // อัปเดตใน groupedItems ด้วย
  setGroupedItems(prevGrouped => {
    const newGrouped = {};
    Object.keys(prevGrouped).forEach(supplier => {
      newGrouped[supplier] = prevGrouped[supplier].map(groupItem => {
        if (groupItem.id === itemId) {
          console.log(`Found item ${itemId} in supplier ${supplier}, updating`);
          return {
            ...groupItem,
            orderQuantity: numericValue
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
      reserve_quantity: parseInt(item.buffer) || 0
    }));
    
    console.log("Sending buffer settings to API:", bufferSettings);
    
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
}, [items, saveBufferSettings, setAlert, setEditingBuffers, setProcessingAction]);
  
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
  

  // ส่งออกค่าและฟังก์ชันทั้งหมดที่ต้องใช้
  return {
    items,
    groupedItems,
    filteredGroupedItems, // เพิ่มมา
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
    // Order quantity controls - เพิ่มมา
    applyAllSuggestedQuantities,
    clearAllOrderQuantities,
    // Supplier filter - เพิ่มมา
    supplierFilter,
    handleSupplierFilterChange,
    // UI state
    alert,
    setAlert,
    error,
    // Sales data
    salesData
    
  };
};

export default usePO;