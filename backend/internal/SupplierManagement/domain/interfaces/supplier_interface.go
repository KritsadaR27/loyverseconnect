package interfaces

import "backend/internal/SupplierManagement/domain/models"

// SupplierRepository interface
type SupplierRepository interface {
	GetSuppliers() ([]models.Supplier, error)
	SaveSupplierSettings(suppliers []models.Supplier) error
	FetchSupplierCycles() ([]models.Supplier, error) // ตรวจสอบให้แน่ใจว่ามี method นี้
}
