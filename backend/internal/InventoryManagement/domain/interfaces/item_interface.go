// backend/internal/InventoryManagement/domain/interfaces/item_interface.go
package interfaces

import "backend/internal/InventoryManagement/domain/models"

// ItemRepository defines the methods that any item repository should implement.
type ItemInterface interface {
	FetchItemStockData() ([]models.ItemStockView, error)
	GetItemByID(itemID string) (models.Item, error)
	GetStockLevels(itemID string) ([]models.InventoryLevel, error)
	UpdateItemStatus(itemID, status string) error
	GetItemStockByStore(itemID string) ([]models.StoreStock, error)          // ใช้ที่ PO
	SaveItemSupplierSetting(supplierSettings []models.CustomItemField) error // ฟังก์ชันใหม่
}
