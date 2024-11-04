// backend/internal/InventoryManagement/domain/models/store.go
package models

type Store struct {
	StoreID   string `json:"store_id"`   // Unique identifier for the store
	StoreName string `json:"store_name"` // Name of the store
}

type StoreStock struct {
	StoreName string  `json:"store_name"`
	InStock   float64 `json:"in_stock"`
}
