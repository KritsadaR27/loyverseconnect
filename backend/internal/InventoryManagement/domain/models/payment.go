// backend/internal/InventoryManagement/domain/models/models.go
package models

// PaymentType represents a payment type in the inventory system.
type PaymentType struct {
	PaymentTypeID string `json:"payment_type_id"` // Unique identifier for the payment type
	Name          string `json:"name"`            // Name of the payment type
	Type          string `json:"type"`            // Type of the payment (e.g., "credit", "debit")
}
