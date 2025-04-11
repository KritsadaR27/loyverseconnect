// internal/POManagement/application/services/calculation_service.go
package services

import (
	"math"
	"time"

	"backend/internal/POManagement/domain/models"
)

// CalculationService จัดการการคำนวณยอดสั่งซื้อ
type CalculationService struct{}

// NewCalculationService สร้าง CalculationService ใหม่
func NewCalculationService() *CalculationService {
	return &CalculationService{}
}

// CalculateRecommendedQuantity คำนวณยอดแนะนำให้สั่งซื้อ
func (s *CalculationService) CalculateRecommendedQuantity(
	currentStock float64,
	buffer int,
	salesData []models.SalesByDay,
	targetDate time.Time,
	deliveryDate time.Time,
) int {
	// คำนวณยอดขายเฉลี่ยต่อวัน
	avgSalesPerDay := s.calculateAverageSalesPerDay(salesData)

	// คำนวณจำนวนวันที่ต้องการให้พอขาย
	daysDiff := int(targetDate.Sub(deliveryDate).Hours()/24) + 1
	if daysDiff < 1 {
		daysDiff = 1
	}

	// คำนวณยอดที่ต้องการให้มี = ยอดขายเฉลี่ย * จำนวนวัน + ยอดเผื่อ
	targetStock := math.Ceil(avgSalesPerDay*float64(daysDiff)) + float64(buffer)

	// คำนวณยอดที่ต้องสั่งซื้อ = ยอดที่ต้องการ - ยอดคงเหลือปัจจุบัน
	suggestedQuantity := targetStock - currentStock
	if suggestedQuantity < 0 {
		suggestedQuantity = 0
	}

	return int(suggestedQuantity)
}

// calculateAverageSalesPerDay คำนวณยอดขายเฉลี่ยต่อวัน
func (s *CalculationService) calculateAverageSalesPerDay(salesData []models.SalesByDay) float64 {
	if len(salesData) == 0 {
		return 1.0 // กรณีไม่มีข้อมูลยอดขาย ให้ค่าเริ่มต้นเป็น 1
	}

	// หาวันที่ไม่ซ้ำกัน
	uniqueDates := make(map[string]bool)
	totalSales := 0.0

	for _, sale := range salesData {
		totalSales += sale.Quantity
		dateStr := sale.Date.Format("2006-01-02")
		uniqueDates[dateStr] = true
	}

	numDays := float64(len(uniqueDates))
	if numDays == 0 {
		return 1.0
	}

	return totalSales / numDays
}
