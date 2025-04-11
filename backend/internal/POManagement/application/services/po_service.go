// internal/POManagement/application/services/po_service.go
package services

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"backend/internal/POManagement/domain/interfaces"
	"backend/internal/POManagement/domain/models"
)

// POService จัดการเรื่อง Purchase Order
// internal/POManagement/application/services/po_service.go
type POService struct {
	poRepo             interfaces.PurchaseOrderRepository
	inventoryService   interfaces.InventoryService
	salesService       interfaces.SalesService
	lineService        interfaces.LineService
	calculationService *CalculationService // เพิ่มฟิลด์นี้
}

// แก้ไขฟังก์ชัน NewPOService
func NewPOService(
	poRepo interfaces.PurchaseOrderRepository,
	inventoryService interfaces.InventoryService,
	salesService interfaces.SalesService,
	lineService interfaces.LineService,
	calculationService *CalculationService, // เพิ่มพารามิเตอร์นี้
) *POService {
	return &POService{
		poRepo:             poRepo,
		inventoryService:   inventoryService,
		salesService:       salesService,
		lineService:        lineService,
		calculationService: calculationService, // กำหนดค่า
	}
}

// GetPOData ดึงข้อมูลสำหรับหน้า PO
func (s *POService) GetPOData(ctx context.Context, deliveryDate time.Time) (*models.POData, error) {
	// 1. ดึงข้อมูลสต็อกจาก Inventory
	stockData, err := s.inventoryService.GetItemStock(ctx)
	if err != nil {
		return nil, fmt.Errorf("error getting stock data: %w", err)
	}

	// 2. สร้างวันที่ในอนาคต (3 วัน)
	futureDates := []time.Time{
		deliveryDate,
		deliveryDate.AddDate(0, 0, 1),
		deliveryDate.AddDate(0, 0, 2),
	}

	// 3. ดึงข้อมูลยอดขายย้อนหลังจาก Sales
	startDate := deliveryDate.AddDate(0, 0, -7) // 7 วันก่อน
	endDate := futureDates[len(futureDates)-1]
	salesData, err := s.salesService.GetSalesByDay(ctx, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("error getting sales data: %w", err)
	}

	// 4. ดึงข้อมูลยอดเผื่อ
	itemIDs := make([]string, len(stockData))
	for i, item := range stockData {
		itemIDs[i] = item.ItemID
	}
	bufferSettings, err := s.poRepo.GetBufferSettings(ctx, itemIDs)
	if err != nil {
		return nil, fmt.Errorf("error getting buffer settings: %w", err)
	}

	// 5. สร้างข้อมูล PO
	poItems := make([]models.POItem, len(stockData))
	for i, item := range stockData {
		buffer := bufferSettings[item.ItemID]

		// คำนวณยอดขายเฉลี่ยย้อนหลัง
		salesByDay := s.calculateSalesByDay(salesData, item.ItemID)

		poItems[i] = models.POItem{
			ItemID:                 item.ItemID,
			ItemName:               item.ItemName,
			CurrentStock:           item.InStock,
			Buffer:                 buffer,
			ProjectedStock:         item.InStock - float64(buffer),
			PreviousSalesByDay:     salesByDay,
			StockByStore:           item.StockByStore,
			Supplier:               item.SupplierName,
			Category:               item.CategoryName,
			OrderQuantity:          0,
			SuggestedOrderQuantity: 0,
		}
	}

	// 6. คำนวณยอดแนะนำเริ่มต้นตามวันที่ลงของ
	poItems = s.calculateSuggestedQuantities(ctx, deliveryDate, poItems, salesData)

	return &models.POData{
		DeliveryDate: deliveryDate,
		FutureDates:  futureDates,
		Items:        poItems,
	}, nil
}

// calculateSalesByDay สร้าง map ยอดขายตามวัน
func (s *POService) calculateSalesByDay(salesData []models.SalesByDay, itemID string) map[string]float64 {
	result := make(map[string]float64)
	for _, sale := range salesData {
		if sale.ItemID == itemID {
			dateKey := sale.Date.Format("2006-01-02")
			result[dateKey] = sale.Quantity
		}
	}
	return result
}

// CalculateSuggestedQuantities คำนวณยอดแนะนำตามวันที่ต้องการให้พอขาย
func (s *POService) CalculateSuggestedQuantities(
	ctx context.Context,
	targetDate time.Time,
	items []models.POItem,
	salesData []models.SalesByDay,
) ([]models.POItem, error) {
	return s.calculateSuggestedQuantities(ctx, targetDate, items, salesData), nil
}

// calculateSuggestedQuantities คำนวณยอดแนะนำตามวันที่ต้องการให้พอขาย (helper method)
func (s *POService) calculateSuggestedQuantities(
	ctx context.Context,
	targetDate time.Time,
	items []models.POItem,
	salesData []models.SalesByDay,
) []models.POItem {
	// คำนวณจำนวนวันที่ต้องการให้พอขาย
	deliveryDate := targetDate
	targetDateEnd := targetDate.AddDate(0, 0, 2) // พอขาย 3 วัน
	daysDiff := int(targetDateEnd.Sub(deliveryDate).Hours()/24) + 1

	// คำนวณยอดขายเฉลี่ยต่อวันของแต่ละสินค้า
	avgSalesPerDay := make(map[string]float64)
	for _, sale := range salesData {
		if _, ok := avgSalesPerDay[sale.ItemID]; !ok {
			avgSalesPerDay[sale.ItemID] = 0
		}
		avgSalesPerDay[sale.ItemID] += sale.Quantity
	}

	// หาจำนวนวันทั้งหมดในข้อมูลยอดขาย
	uniqueDates := make(map[string]bool)
	for _, sale := range salesData {
		dateStr := sale.Date.Format("2006-01-02")
		uniqueDates[dateStr] = true
	}
	totalDays := float64(len(uniqueDates))
	if totalDays == 0 {
		totalDays = 1 // ป้องกันการหารด้วย 0
	}

	// คำนวณยอดขายเฉลี่ยต่อวัน
	for itemID, totalSales := range avgSalesPerDay {
		avgSalesPerDay[itemID] = totalSales / totalDays
	}

	// คำนวณยอดแนะนำสำหรับแต่ละสินค้า
	for i := range items {
		avgSales := avgSalesPerDay[items[i].ItemID]
		if avgSales == 0 {
			avgSales = 1 // กรณีไม่มียอดขาย ให้สั่งขั้นต่ำ 1 ชิ้น
		}

		// คำนวณยอดที่ต้องการให้พอขาย = ยอดขายเฉลี่ย * จำนวนวัน + ยอดเผื่อ
		targetStock := math.Ceil(avgSales*float64(daysDiff)) + float64(items[i].Buffer)

		// คำนวณยอดที่ต้องสั่งซื้อ = ยอดที่ต้องการ - ยอดคงเหลือปัจจุบัน
		suggestedQuantity := targetStock - items[i].CurrentStock
		if suggestedQuantity < 0 {
			suggestedQuantity = 0
		}

		items[i].SuggestedOrderQuantity = int(suggestedQuantity)
		// ตั้งค่ายอดสั่งเริ่มต้นเท่ากับยอดแนะนำ
		items[i].OrderQuantity = items[i].SuggestedOrderQuantity
	}

	return items
}

// SaveBufferSettings บันทึกยอดเผื่อ
func (s *POService) SaveBufferSettings(ctx context.Context, settings []models.BufferSettings) error {
	// ตั้งค่าเวลาปัจจุบัน
	now := time.Now()
	for i := range settings {
		settings[i].CreatedAt = now
		settings[i].UpdatedAt = now
	}
	return s.poRepo.SaveBufferSettings(ctx, settings)
}

// CreatePO สร้างใบสั่งซื้อ
func (s *POService) CreatePO(ctx context.Context, po *models.PurchaseOrder) error {
	// ตรวจสอบความถูกต้องของข้อมูล
	if po.SupplierID == "" {
		return errors.New("supplier ID is required")
	}
	if po.DeliveryDate.IsZero() {
		return errors.New("delivery date is required")
	}
	if len(po.Items) == 0 {
		return errors.New("at least one item is required")
	}

	// สร้างหมายเลข PO
	po.PONumber = fmt.Sprintf("PO-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%1000)
	po.Status = models.StatusPending
	po.CreatedAt = time.Now()
	po.UpdatedAt = time.Now()

	// คำนวณยอดรวม
	var totalAmount float64
	for i := range po.Items {
		po.Items[i].TotalPrice = po.Items[i].UnitPrice * float64(po.Items[i].Quantity)
		totalAmount += po.Items[i].TotalPrice
	}
	po.TotalAmount = totalAmount

	return s.poRepo.CreatePO(ctx, po)
}

// GetPOByID ดึงใบสั่งซื้อตาม ID
func (s *POService) GetPOByID(ctx context.Context, id int) (*models.PurchaseOrder, error) {
	return s.poRepo.GetPOByID(ctx, id)
}

// GetAllPOs ดึงใบสั่งซื้อทั้งหมด
func (s *POService) GetAllPOs(ctx context.Context, filters map[string]interface{}) ([]*models.PurchaseOrder, error) {
	return s.poRepo.GetAllPOs(ctx, filters)
}

// SendLineNotification ส่งแจ้งเตือนทางไลน์
func (s *POService) SendLineNotification(ctx context.Context, groupIDs []string, po *models.PurchaseOrder) error {
	// สร้างข้อความสำหรับส่งไลน์
	message := s.formatPOMessage(po)

	return s.lineService.SendMessage(ctx, groupIDs, message)
}

// formatPOMessage สร้างข้อความสำหรับส่งไลน์
func (s *POService) formatPOMessage(po *models.PurchaseOrder) string {
	message := fmt.Sprintf("📦 ใบสั่งซื้อเลขที่: %s\n", po.PONumber)
	message += fmt.Sprintf("ซัพพลายเออร์: %s\n", po.SupplierName)
	message += fmt.Sprintf("วันที่ส่งของ: %s\n", po.DeliveryDate.Format("02/01/2006"))
	message += fmt.Sprintf("มูลค่ารวม: %.2f บาท\n\n", po.TotalAmount)

	message += "รายการสินค้า:\n"
	for i, item := range po.Items {
		message += fmt.Sprintf("%d. %s - จำนวน %d ชิ้น\n", i+1, item.ItemName, item.Quantity)
	}

	return message
}

// GetSalesByDay ดึงข้อมูลยอดขายตามช่วงวันที่
func (s *POService) GetSalesByDay(ctx context.Context, startDate, endDate time.Time) ([]models.SalesByDay, error) {
	return s.salesService.GetSalesByDay(ctx, startDate, endDate)
}

// internal/POManagement/application/services/po_service.go

// GetBufferSettingsBatch ดึงข้อมูล buffer settings สำหรับ item IDs จำนวนมาก
func (s *POService) GetBufferSettingsBatch(ctx context.Context, itemIDs []string) (map[string]int, error) {
	return s.poRepo.GetBufferSettingsBatch(ctx, itemIDs)
}
