// backend/internal/InventoryManagement/application/services/item_stock_service.go
package services

import (
	"backend/internal/InventoryManagement/domain/interfaces"
	"backend/internal/InventoryManagement/domain/models"
)

type ItemService struct {
	itemInterface interfaces.ItemInterface
}

func NewItemService(itemInterface interfaces.ItemInterface) *ItemService {
	return &ItemService{itemInterface: itemInterface}
}

func (s *ItemService) GetItemStockData() ([]models.ItemStockView, error) {
	return s.itemInterface.FetchItemStockData()
}

func (s *ItemService) GetStockLevels(itemID string) ([]models.InventoryLevel, error) {
	return s.itemInterface.GetStockLevels(itemID)
}

func (s *ItemService) GetItemByID(itemID string) (models.Item, error) {
	return s.itemInterface.GetItemByID(itemID)
}

func (s *ItemService) UpdateItemStatus(itemID, status string) error {
	return s.itemInterface.UpdateItemStatus(itemID, status)
}

// backend/internal/InventoryManagement/application/services/item_service.go
func (s *ItemService) GetItemStockByStore(itemID string) ([]models.StoreStock, error) {
	return s.itemInterface.GetItemStockByStore(itemID)
}
