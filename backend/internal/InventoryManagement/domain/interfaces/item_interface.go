// backend/internal/InventoryManagement/domain/interfaces/item_interface.go
package interfaces

import "backend/internal/InventoryManagement/domain/models"

type ItemInterface interface {
	FetchItemStockData() ([]models.ItemStockView, error)
	GetItemByID(itemID string) (models.Item, error)
	GetStockLevels(itemID string) ([]models.InventoryLevel, error)
	UpdateItemStatus(itemID, status string) error
	GetItemStockByStore(itemID string) ([]models.StoreStock, error) // ใช้ที่ PO
}
