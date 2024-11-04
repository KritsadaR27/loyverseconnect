// backend/internal/InventoryManagement/infrastructure/repositories/stock_data.go
package data

import "backend/internal/InventoryManagement/domain/models"

// StockRepository defines methods for accessing stock level data.
type StockRepository interface {
	// GetStockByItemAndStore fetches the stock level for a specific item at a specific store.
	GetStockByItemAndStore(itemID, storeID string) (models.InventoryLevel, error)

	// UpdateStock updates the stock level for a specific item at a specific store.
	UpdateStock(itemID, storeID string, quantity float64) error

	// GetAllStockLevels retrieves stock levels across all stores for a given item.
	GetAllStockLevels(itemID string) ([]models.InventoryLevel, error)
}
