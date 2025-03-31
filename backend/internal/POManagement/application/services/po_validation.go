package services

import (
	"errors"

	"backend/internal/POManagement/domain/models"
)

// services/po_validation.go
func validatePurchaseOrder(po *models.PurchaseOrder) error {
	if po.SupplierID == "" {
		return errors.New("supplier ID is required")
	}
	if po.OrderDate.IsZero() {
		return errors.New("order date is required")
	}
	if po.ExpectedDeliveryDate.Before(po.OrderDate) {
		return errors.New("expected delivery date must be after order date")
	}
	// ... more validations
	return nil
}
