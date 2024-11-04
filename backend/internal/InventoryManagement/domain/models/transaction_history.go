// backend/internal/InventoryManagement/domain/models/transaction_history.go
package models

import (
	"time"
)

type Transaction struct {
	TransactionID   string    `json:"transaction_id"`   // Unique identifier for the transaction
	TransactionType string    `json:"transaction_type"` // Type of transaction: "sale", "restock", "transfer", etc.
	ItemID          string    `json:"item_id"`          // Foreign key to Item
	VariantID       string    `json:"variant_id"`       // Foreign key to Variant (same as Item for single-variant items)
	StoreID         string    `json:"store_id"`         // Store involved in the transaction
	Quantity        float64   `json:"quantity"`         // Quantity involved in the transaction
	TotalCost       float64   `json:"total_cost"`       // Total cost involved (for purchases or stock additions)
	TotalRevenue    float64   `json:"total_revenue"`    // Total revenue generated (for sales)
	CreatedAt       time.Time `json:"created_at"`       // Transaction timestamp
}
