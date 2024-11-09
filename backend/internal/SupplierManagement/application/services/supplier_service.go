// application/services/supplier_service.go
package services

import (
	"backend/internal/SupplierManagement/domain/interfaces"
	"backend/internal/SupplierManagement/domain/models"
)

type SupplierService struct {
	repo interfaces.SupplierRepository
}

func NewSupplierService(repo interfaces.SupplierRepository) *SupplierService {
	return &SupplierService{repo: repo}
}

func (s *SupplierService) GetAllSuppliers() ([]models.SupplierWithCustomFields, error) {
	return s.repo.GetSuppliers()
}

func (s *SupplierService) SaveCustomSupplierFields(supplierFields []models.CustomSupplierField) error {
	return s.repo.SaveCustomSupplierFields(supplierFields)
}
