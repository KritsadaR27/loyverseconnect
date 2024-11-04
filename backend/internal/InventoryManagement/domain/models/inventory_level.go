// /backend/internal/InventoryManagement/domain/models/inventory_level.go
package models

import (
	"time"
)

type InventoryLevel struct {
	VariantID string    `json:"variant_id"` // Unique identifier for the variant, linked to Item
	StoreID   string    `json:"store_id"`   // Store where this inventory is tracked
	InStock   float64   `json:"in_stock"`   // Quantity currently in stock
	UpdatedAt time.Time `json:"updated_at"` // Last updated timestamp for this stock level
}
