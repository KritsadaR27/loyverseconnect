// backend/internal/InventoryManagement/infrastructure/repositories/analytics_data.go
package data

import "backend/internal/InventoryManagement/domain/models"

// AnalyticsRepository defines methods for analytics data.
type AnalyticsRepository interface {
	GetSalesData(itemID string) ([]models.Transaction, error)
	GetRestockData(itemID string) ([]models.Transaction, error)
}
