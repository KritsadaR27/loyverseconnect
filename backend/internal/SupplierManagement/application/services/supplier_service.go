// application/services/supplier_service.go
package services

import (
	"backend/internal/SupplierManagement/domain/interfaces"
	"backend/internal/SupplierManagement/domain/models"
	"database/sql"
	"strings"
)

type SupplierService struct {
	repo interfaces.SupplierRepository
}

func NewSupplierService(repo interfaces.SupplierRepository) *SupplierService {
	return &SupplierService{repo: repo}
}

func (s *SupplierService) GetAllSuppliers() ([]models.Supplier, error) {
	return s.repo.GetSuppliers()
}

func (s *SupplierService) SaveSupplierSettings(suppliers []models.SupplierInput) error {
	var updatedSuppliers []models.Supplier
	for _, input := range suppliers {
		orderCycle := sql.NullString{String: input.OrderCycle, Valid: input.OrderCycle != ""}
		selectedDays := sql.NullString{String: strings.Join(input.SelectedDays, ","), Valid: len(input.SelectedDays) > 0}

		supplier := models.Supplier{
			SupplierID:   input.SupplierID,
			SupplierName: input.SupplierName,
			OrderCycle:   orderCycle,
			SortOrder:    input.SortOrder,
			SelectedDays: selectedDays,
		}
		updatedSuppliers = append(updatedSuppliers, supplier)
	}
	return s.repo.SaveSupplierSettings(updatedSuppliers)
}
