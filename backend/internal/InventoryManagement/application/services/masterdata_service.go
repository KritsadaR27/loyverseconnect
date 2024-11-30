// backend/internal/InventoryManagement/application/services/masterdata_service.go
package services

import (
	"backend/internal/InventoryManagement/domain/interfaces"
	"backend/internal/InventoryManagement/domain/models"
)

type MasterDataService struct {
	itemInterface interfaces.ItemInterface
}

func NewMasterDataService(itemInterface interfaces.ItemInterface) *MasterDataService {
	return &MasterDataService{itemInterface: itemInterface}
}

func (s *MasterDataService) GetCategories() ([]models.Category, error) {
	return s.itemInterface.FetchCategories()
}

func (s *MasterDataService) GetItems() ([]models.Item, error) {
	return s.itemInterface.FetchItems()
}

func (s *MasterDataService) GetPaymentTypes() ([]models.PaymentType, error) {
	return s.itemInterface.FetchPaymentTypes()
}

func (s *MasterDataService) GetStores() ([]models.Store, error) {
	return s.itemInterface.FetchStores()
}

func (s *MasterDataService) GetSuppliers() ([]models.Supplier, error) {
	return s.itemInterface.FetchSuppliers()
}
