// backend/internal/InventoryManagement/domain/services/analytics/sales_analysis_service.go
package analytics

import (
	"backend/internal/InventoryManagement/infrastructure/data"
)

// SalesAnalysisService provides sales analytics for items.
type SalesAnalysisService struct {
	repo data.AnalyticsRepository
}

// CalculateAvgSales calculates average daily sales for an item.
func (s *SalesAnalysisService) CalculateAvgSales(itemID string) (float64, error) {
	salesData, err := s.repo.GetSalesData(itemID)
	if err != nil {
		return 0, err
	}
	totalSales := 0.0
	for _, sale := range salesData {
		totalSales += sale.Quantity
	}
	return totalSales / float64(len(salesData)), nil
}
