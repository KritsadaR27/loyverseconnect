// interfaces/supplier_repository.go
package interfaces

import "backend/internal/SupplierManagement/domain/models"

type SupplierRepository interface {
	GetSuppliers() ([]models.SupplierWithCustomFields, error)
	SaveCustomSupplierFields(supplierFields []models.CustomSupplierField) error
}
