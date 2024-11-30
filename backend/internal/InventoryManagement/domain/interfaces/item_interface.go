// backend/internal/InventoryManagement/domain/interfaces/item_interface.go
package interfaces

import "backend/internal/InventoryManagement/domain/models"

// ItemInterface defines the methods that any item repository should implement.
type ItemInterface interface {
	FetchItemStockData() ([]models.ItemStockView, error)
	GetItemByID(itemID string) (models.Item, error)
	GetStockLevels(itemID string) ([]models.InventoryLevel, error)
	UpdateItemStatus(itemID, status string) error
	GetItemStockByStore(itemID string) ([]models.StoreStock, error)
	SaveItemSupplierSetting(supplierSettings []models.CustomItemField) error
	FetchCategories() ([]models.Category, error)
	FetchItems() ([]models.Item, error)
	FetchStores() ([]models.Store, error)
	FetchSuppliers() ([]models.Supplier, error)
	FetchPaymentTypes() ([]models.PaymentType, error)
}
